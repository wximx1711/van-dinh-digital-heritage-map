# Install Git hooks for the Van Dinh Digital Heritage Map repository.
# Copies scripts/git-hooks/pre-commit into .git/hooks/pre-commit.

$RepoRoot = Split-Path -Parent $PSScriptRoot
$Source = Join-Path $RepoRoot "scripts\git-hooks\pre-commit"
$HooksDir = Join-Path $RepoRoot ".git\hooks"
$Dest = Join-Path $HooksDir "pre-commit"

# Create .git/hooks if it doesn't exist
if (-not (Test-Path -LiteralPath $HooksDir)) {
    New-Item -ItemType Directory -Path $HooksDir -Force | Out-Null
}

# Check if the destination already exists
if (Test-Path -LiteralPath $Dest) {
    $answer = Read-Host "Overwrite existing .git\hooks\pre-commit? [y/N]"
    if ($answer -ne "y" -and $answer -ne "Y") {
        Write-Host "Installation cancelled."
        exit 0
    }
}

Copy-Item -Path $Source -Destination $Dest -Force

# Preserve executable permissions on non-Windows (Unix-style)
if ($PSVersionTable.PSEdition -eq "Core" -and ($IsLinux -or $IsMacOS)) {
    chmod +x $Dest 2>&1 | Out-Null
}

Write-Host "Git hook installed: $Dest"
