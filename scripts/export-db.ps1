#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Export VanDinhDigitalMap database to backend/database/VanDinhDigitalMap.sql
.DESCRIPTION
    Generates a complete SQL Server database recreation script (schema + data).
    Uses pure .NET System.Data.SqlClient. Supports PowerShell 5.1+.
.NOTES
    Server: localhost, Database: VanDinhDigitalMap, Auth: Windows
#>

$ErrorActionPreference = "Stop"

$ServerName = "localhost"
$DatabaseName = "VanDinhDigitalMap"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$OutputPath = [System.IO.Path]::Combine($RepoRoot, "backend", "database", "VanDinhDigitalMap.sql")
$ConnStr = "Server=$ServerName;Database=$DatabaseName;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True;"

function Get-FieldValue {
    param($reader, $i)
    if ($reader.IsDBNull($i)) { return $null }
    $t = $reader.GetFieldType($i).Name
    if ($t -eq "String")   { return $reader.GetString($i) }
    if ($t -eq "Int32")    { return $reader.GetInt32($i) }
    if ($t -eq "Int64")    { return $reader.GetInt64($i) }
    if ($t -eq "Byte")     { return $reader.GetByte($i) }
    if ($t -eq "Int16")    { return $reader.GetInt16($i) }
    if ($t -eq "Boolean")  { return [long]($reader.GetBoolean($i)) }
    if ($t -eq "Decimal")  { return $reader.GetDecimal($i) }
    if ($t -eq "Double")   { return $reader.GetDouble($i) }
    if ($t -eq "Single")   { return [double]$reader.GetFloat($i) }
    if ($t -eq "DateTime") { return $reader.GetDateTime($i) }
    if ($t -eq "DateTimeOffset") { return $reader.GetDateTimeOffset($i) }
    if ($t -eq "Byte[]")   { return [byte[]]$reader.GetValue($i) }
    return $reader.GetValue($i).ToString()
}

function Format-Value {
    param($value)
    if ($null -eq $value) { return "NULL" }
    $t = $value.GetType().Name
    if ($t -eq "String") {
        $s = $value -replace "'", "''"
        return "N'$s'"
    }
    if ($t -in @("Int32","Int64","Byte","Int16")) { return "$value" }
    if ($t -eq "Double")  { return $value.ToString([Globalization.CultureInfo]::InvariantCulture) }
    if ($t -eq "Decimal") { return $value.ToString([Globalization.CultureInfo]::InvariantCulture) }
    if ($t -eq "DateTime") {
        return "'$($value.ToString('yyyy-MM-ddTHH:mm:ss.fffffff'))'"
    }
    if ($t -eq "DateTimeOffset") {
        return "'$($value.ToString('yyyy-MM-ddTHH:mm:ss.fffffffzzz'))'"
    }
    if ($t -eq "Byte[]") {
        $h = [BitConverter]::ToString([byte[]]$value) -replace '-', ''
        return "0x$h"
    }
    return "N'$value'"
}

Write-Host "Exporting database [$DatabaseName] ..." -ForegroundColor Cyan

$OutputDir = Split-Path -Parent $OutputPath
if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null }

$sb = New-Object System.Text.StringBuilder
$now = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

# ─── HEADER ─────────────────────────────────────────────────────
$null = $sb.AppendLine("/*==========================================================")
$null = $sb.AppendLine("    PROJECT : VAN DINH DIGITAL HERITAGE MAP")
$null = $sb.AppendLine("    DATABASE: $DatabaseName")
$null = $sb.AppendLine("    GENERATED: $now")
$null = $sb.AppendLine("    SOURCE  : Auto-generated database snapshot")
$null = $sb.AppendLine("    PURPOSE : Complete database recreation script")
$null = $sb.AppendLine()
$null = $sb.AppendLine("    Run:")
$null = $sb.AppendLine("        sqlcmd -S localhost -E -i backend\database\VanDinhDigitalMap.sql")
$null = $sb.AppendLine("==========================================================*/")
$null = $sb.AppendLine()
$null = $sb.AppendLine("USE master;")
$null = $sb.AppendLine("GO")
$null = $sb.AppendLine()
$null = $sb.AppendLine("IF DB_ID(N'$DatabaseName') IS NOT NULL")
$null = $sb.AppendLine("BEGIN")
$null = $sb.AppendLine("    ALTER DATABASE [$DatabaseName]")
$null = $sb.AppendLine("    SET SINGLE_USER")
$null = $sb.AppendLine("    WITH ROLLBACK IMMEDIATE;")
$null = $sb.AppendLine()
$null = $sb.AppendLine("    DROP DATABASE [$DatabaseName];")
$null = $sb.AppendLine("END")
$null = $sb.AppendLine("GO")
$null = $sb.AppendLine()
$null = $sb.AppendLine("CREATE DATABASE [$DatabaseName];")
$null = $sb.AppendLine("GO")
$null = $sb.AppendLine()
$null = $sb.AppendLine("USE [$DatabaseName];")
$null = $sb.AppendLine("GO")
$null = $sb.AppendLine()

$null = $sb.AppendLine("-- ========================================")
$null = $sb.AppendLine("-- TABLES")
$null = $sb.AppendLine("-- ========================================")
$null = $sb.AppendLine()

# ─── Open connection ────────────────────────────────────────────
$conn = New-Object System.Data.SqlClient.SqlConnection($ConnStr)
$conn.Open()

# ─── Get table list ─────────────────────────────────────────────
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo' ORDER BY TABLE_NAME"
$reader = $cmd.ExecuteReader()
$allTables = New-Object System.Collections.Generic.List[string]
while ($reader.Read()) { $allTables.Add($reader.GetString(0)) }
$reader.Close()

# ─── Sort tables by dependency (referenced tables first) ────────
function Get-DependencyOrder {
    param([System.Collections.Generic.List[string]]$tables)
    
    $depMap = @{}
    $cmd = $conn.CreateCommand()
    foreach ($t in $tables) {
        $cmd.CommandText = "SELECT OBJECT_NAME(fk.referenced_object_id) FROM sys.foreign_keys fk WHERE fk.parent_object_id = OBJECT_ID('[$t]')"
        $r = $cmd.ExecuteReader()
        $deps = New-Object System.Collections.Generic.List[string]
        while ($r.Read()) {
            if (-not $r.IsDBNull(0)) { $deps.Add($r.GetString(0)) }
        }
        $r.Close()
        $depMap[$t] = $deps
    }
    
    $visited = @{}
    $result = New-Object System.Collections.Generic.List[string]
    function TopSort-Node($node) {
        if ($visited.ContainsKey($node)) { return }
        $visited[$node] = $true
        if ($depMap.ContainsKey($node)) {
            foreach ($dep in $depMap[$node]) {
                if ($depMap.ContainsKey($dep)) { TopSort-Node $dep }
            }
        }
        $result.Add($node)
    }
    foreach ($t in $tables) { TopSort-Node $t }
    return $result
}

$orderedTables = Get-DependencyOrder $allTables
$allRowsExported = 0

# ════════════════════════════════════════════════════════════════
# SCHEMA GENERATION
# ════════════════════════════════════════════════════════════════

foreach ($table in $orderedTables) {
    Write-Host "  Schema: [$table]" -ForegroundColor Gray
    
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = @"
SELECT c.name, t.name AS type_name, c.max_length, c.precision, c.scale, c.is_nullable, c.is_identity, c.is_computed, dc.definition
FROM sys.columns c
JOIN sys.types t ON c.user_type_id = t.user_type_id
LEFT JOIN sys.default_constraints dc ON dc.parent_column_id = c.column_id AND dc.parent_object_id = c.object_id
WHERE c.object_id = OBJECT_ID('[$table]')
ORDER BY c.column_id
"@
    $reader = $cmd.ExecuteReader()
    $cols = New-Object System.Collections.Generic.List[hashtable]
    while ($reader.Read()) {
        $cols.Add(@{
            Name = $reader.GetString(0)
            TypeName = $reader.GetString(1)
            MaxLen = if ($reader.IsDBNull(2)) { $null } else { [int]$reader.GetInt16(2) }
            Precision = if ($reader.IsDBNull(3)) { $null } else { [byte]$reader.GetByte(3) }
            Scale = if ($reader.IsDBNull(4)) { $null } else { [byte]$reader.GetByte(4) }
            IsNullable = $reader.GetBoolean(5)
            IsIdentity = $reader.GetBoolean(6)
            IsComputed = $reader.GetBoolean(7)
            Default = if ($reader.IsDBNull(8)) { $null } else { $reader.GetString(8) }
        })
    }
    $reader.Close()
    
    # Primary key columns
    $pkList = New-Object System.Collections.Generic.List[string]
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = @"
SELECT c.name
FROM sys.indexes i
JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.is_primary_key = 1 AND i.object_id = OBJECT_ID('[$table]')
ORDER BY ic.key_ordinal
"@
    $reader = $cmd.ExecuteReader()
    while ($reader.Read()) { $pkList.Add($reader.GetString(0)) }
    $reader.Close()
    
    # Foreign keys
    $fkList = New-Object System.Collections.Generic.List[hashtable]
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = @"
SELECT fk.name, COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS col,
       OBJECT_NAME(fk.referenced_object_id) AS ref_table,
       COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS ref_col,
       fk.delete_referential_action_desc,
       fk.update_referential_action_desc
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
WHERE fk.parent_object_id = OBJECT_ID('[$table]')
"@
    $reader = $cmd.ExecuteReader()
    while ($reader.Read()) {
        $fkList.Add(@{
            Name = $reader.GetString(0)
            Col = $reader.GetString(1)
            RefTable = $reader.GetString(2)
            RefCol = $reader.GetString(3)
            DeleteAction = $reader.GetString(4)
            UpdateAction = $reader.GetString(5)
        })
    }
    $reader.Close()
    
    # Check constraints
    $ckList = New-Object System.Collections.Generic.List[hashtable]
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "SELECT name, definition FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('[$table]')"
    $reader = $cmd.ExecuteReader()
    while ($reader.Read()) {
        $ckList.Add(@{ Name = $reader.GetString(0); Definition = $reader.GetString(1) })
    }
    $reader.Close()
    
    # Unique indexes (but not PKs, not unique constraints)
    $uqGroups = @{}
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = @"
SELECT i.name AS idx_name, c.name AS col_name
FROM sys.indexes i
JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.is_unique = 1 AND i.is_primary_key = 0 AND i.is_unique_constraint = 0
  AND i.object_id = OBJECT_ID('[$table]')
ORDER BY i.index_id, ic.key_ordinal
"@
    $reader = $cmd.ExecuteReader()
    while ($reader.Read()) {
        $n = $reader.GetString(0)
        $cl = $reader.GetString(1)
        if (-not $uqGroups.ContainsKey($n)) { $uqGroups[$n] = New-Object System.Collections.Generic.List[string] }
        $uqGroups[$n].Add($cl)
    }
    $reader.Close()
    
    # ─── Generate CREATE TABLE ───
    $null = $sb.AppendLine("CREATE TABLE [$table] (")
    $lines = New-Object System.Collections.Generic.List[string]
    
    foreach ($col in $cols) {
        if ($col.IsComputed) { continue }
        $line = "    [$($col.Name)] "
        $t = $col.TypeName.ToLower()
        
        if ($t -eq "nvarchar" -and ($null -eq $col.MaxLen -or $col.MaxLen -le -1)) { $line += "nvarchar(MAX)" }
        elseif ($t -eq "nvarchar") { $line += "nvarchar($($col.MaxLen / 2))" }
        elseif ($t -eq "varchar" -and ($null -eq $col.MaxLen -or $col.MaxLen -le -1)) { $line += "varchar(MAX)" }
        elseif ($t -eq "varchar") { $line += "varchar($($col.MaxLen))" }
        elseif ($t -eq "nchar") { $line += "nchar($($col.MaxLen / 2))" }
        elseif ($t -eq "char") { $line += "char($($col.MaxLen))" }
        elseif ($t -in @("decimal","numeric")) { $line += "decimal($($col.Precision),$($col.Scale))" }
        elseif ($t -eq "datetime2") { $line += "datetime2($($col.Scale))" }
        elseif ($t -eq "datetimeoffset") { $line += "datetimeoffset($($col.Scale))" }
        elseif ($t -eq "time") { $line += "time($($col.Scale))" }
        elseif ($t -in @("varbinary")) {
            if ($null -eq $col.MaxLen -or $col.MaxLen -le -1) { $line += "varbinary(MAX)" }
            else { $line += "varbinary($($col.MaxLen))" }
        }
        else { $line += $col.TypeName }
        
        if (-not $col.IsIdentity) {
            if ($col.IsNullable) { $line += " NULL" }
            else { $line += " NOT NULL" }
        }
        
        if ($col.IsIdentity) { $line += " IDENTITY(1,1)" }
        
        if ($col.Default -and -not $col.IsIdentity) {
            $line += " CONSTRAINT [DF_$($table)_$($col.Name)] DEFAULT $($col.Default)"
        }
        
        $lines.Add($line)
    }
    
    if ($pkList.Count -gt 0) {
        $pkStr = ($pkList | ForEach-Object { "[$_]" }) -join ", "
        $lines.Add("    CONSTRAINT [PK_$($table)] PRIMARY KEY CLUSTERED ($pkStr)")
    }
    
    $fkDone = @{}
    foreach ($fk in $fkList) {
        if ($fkDone.ContainsKey($fk.Name)) { continue }
        $fkDone[$fk.Name] = $true
        $fkCols = ($fkList | Where-Object { $_.Name -eq $fk.Name } | ForEach-Object { "[$($_.Col)]" }) -join ", "
        $refCols = ($fkList | Where-Object { $_.Name -eq $fk.Name } | ForEach-Object { "[$($_.RefCol)]" }) -join ", "
        $line = "    CONSTRAINT [$($fk.Name)] FOREIGN KEY ($fkCols) REFERENCES [$($fk.RefTable)]($refCols)"
        if ($fk.DeleteAction -ne "NO_ACTION") { $line += " ON DELETE $($fk.DeleteAction -replace '_',' ')" }
        if ($fk.UpdateAction -ne "NO_ACTION") { $line += " ON UPDATE $($fk.UpdateAction -replace '_',' ')" }
        $lines.Add($line)
    }
    
    foreach ($ck in $ckList) {
        $lines.Add("    CONSTRAINT [$($ck.Name)] CHECK $($ck.Definition)")
    }
    
    foreach ($entry in $uqGroups.GetEnumerator()) {
        $uqStr = ($entry.Value | ForEach-Object { "[$_]" }) -join ", "
        $lines.Add("    CONSTRAINT [$($entry.Key)] UNIQUE ($uqStr)")
    }
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $null = $sb.Append($lines[$i])
        if ($i -lt $lines.Count - 1) { $null = $sb.Append(",") }
        $null = $sb.AppendLine()
    }
    
    $null = $sb.AppendLine(");")
    $null = $sb.AppendLine("GO")
    $null = $sb.AppendLine()
}

# ════════════════════════════════════════════════════════════════
# INDEXES
# ════════════════════════════════════════════════════════════════

$null = $sb.AppendLine("-- ========================================")
$null = $sb.AppendLine("-- INDEXES (NON-CLUSTERED)")
$null = $sb.AppendLine("-- ========================================")
$null = $sb.AppendLine()

foreach ($table in $orderedTables) {
    $indexGroups = @{}
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = @"
SELECT i.name AS idx_name, i.is_unique, c.name AS col_name
FROM sys.indexes i
JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.is_primary_key = 0
  AND i.is_unique = 0
  AND i.is_unique_constraint = 0
  AND i.type_desc = 'NONCLUSTERED'
  AND i.name IS NOT NULL
  AND i.object_id = OBJECT_ID('[$table]')
ORDER BY i.name, ic.key_ordinal
"@
    $reader = $cmd.ExecuteReader()
    while ($reader.Read()) {
        $n = $reader.GetString(0)
        if (-not $indexGroups.ContainsKey($n)) {
            $indexGroups[$n] = @{ IsUnique = $reader.GetBoolean(1); Columns = New-Object System.Collections.Generic.List[string] }
        }
        $indexGroups[$n].Columns.Add($reader.GetString(2))
    }
    $reader.Close()
    
    foreach ($entry in $indexGroups.GetEnumerator()) {
        $idx = $entry.Value
        $colStr = ($idx.Columns | ForEach-Object { "[$_]" }) -join ", "
        $null = $sb.Append("CREATE ")
        if ($idx.IsUnique) { $null = $sb.Append("UNIQUE ") }
        $null = $sb.AppendLine("NONCLUSTERED INDEX [$($entry.Key)] ON [$table]($colStr);")
        $null = $sb.AppendLine("GO")
        $null = $sb.AppendLine()
    }
}

# ════════════════════════════════════════════════════════════════
# DATA
# ════════════════════════════════════════════════════════════════

$null = $sb.AppendLine("-- ========================================")
$null = $sb.AppendLine("-- SEED AND CURRENT DATA")
$null = $sb.AppendLine("-- ========================================")
$null = $sb.AppendLine()

foreach ($table in $orderedTables) {
    Write-Host "  Data: [$table]" -ForegroundColor Gray
    
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "SELECT COUNT_BIG(*) FROM [$table]"
    $rowCount = [long]$cmd.ExecuteScalar()
    
    if ($rowCount -eq 0) {
        $null = $sb.AppendLine("-- [$table]: 0 rows")
        $null = $sb.AppendLine("GO")
        $null = $sb.AppendLine()
        continue
    }
    
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "SELECT c.name FROM sys.columns c WHERE c.object_id = OBJECT_ID('[$table]') AND c.is_identity = 1"
    $idCol = $cmd.ExecuteScalar()
    $hasIdentity = ($null -ne $idCol -and ($idCol -is [string]))
    
    $null = $sb.AppendLine("-- [$table]: $rowCount rows")
    
    if ($hasIdentity) {
        $null = $sb.AppendLine("SET IDENTITY_INSERT [$table] ON;")
    }
    
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "SELECT c.name FROM sys.columns c WHERE c.object_id = OBJECT_ID('[$table]') AND c.is_computed = 0 ORDER BY c.column_id"
    $reader2 = $cmd.ExecuteReader()
    $insertCols = New-Object System.Collections.Generic.List[string]
    while ($reader2.Read()) { $insertCols.Add($reader2.GetString(0)) }
    $reader2.Close()
    
    $colListStr = "[" + ($insertCols -join "],[") + "]"
    $selectColStr = ($insertCols | ForEach-Object { "[$_]" }) -join ","
    
    $cmd2 = $conn.CreateCommand()
    $cmd2.CommandText = "SELECT $selectColStr FROM [$table]"
    $cmd2.CommandTimeout = 120
    $reader2 = $cmd2.ExecuteReader()
    
    while ($reader2.Read()) {
        $null = $sb.Append("INSERT [$table] ($colListStr) VALUES (")
        for ($i = 0; $i -lt $insertCols.Count; $i++) {
            if ($i -gt 0) { $null = $sb.Append(", ") }
            $val = Get-FieldValue $reader2 $i
            $fval = Format-Value $val
            $null = $sb.Append($fval)
        }
        $null = $sb.AppendLine(");")
        $allRowsExported++
    }
    $reader2.Close()
    
    if ($hasIdentity) {
        $null = $sb.AppendLine("SET IDENTITY_INSERT [$table] OFF;")
        $null = $sb.AppendLine("GO")
        $cmd2 = $conn.CreateCommand()
        $cmd2.CommandText = "SELECT IDENT_CURRENT('[$table]')"
        $currentId = $cmd2.ExecuteScalar()
        if ($currentId -is [decimal]) { $currentId = [long]$currentId }
        $null = $sb.AppendLine("DBCC CHECKIDENT ([$table], RESEED, $currentId);")
        $null = $sb.AppendLine("GO")
    } else {
        $null = $sb.AppendLine("GO")
    }
    $null = $sb.AppendLine()
}

$null = $sb.AppendLine("PRINT 'Database [$DatabaseName] has been recreated successfully.';")
$null = $sb.AppendLine("GO")

$conn.Close()

# ─── Write output file ──────────────────────────────────────────
[System.IO.File]::WriteAllText($OutputPath, $sb.ToString(), [System.Text.Encoding]::UTF8)

$lineCount = ($sb.ToString() -split "`n").Count
$fileInfo = Get-Item $OutputPath

Write-Host "`nDone!" -ForegroundColor Green
Write-Host "  Output: $OutputPath"
Write-Host "  Size:  $($fileInfo.Length.ToString('N0')) bytes"
Write-Host "  Lines: $lineCount"
Write-Host "  Rows:  $allRowsExported INSERT statements"
Write-Host "`nTo restore:  sqlcmd -S localhost -E -i backend\database\VanDinhDigitalMap.sql"
