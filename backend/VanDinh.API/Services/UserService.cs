using VanDinh.API.DTOs;
using VanDinh.API.Models;
using VanDinh.API.Repositories;

namespace VanDinh.API.Services;

public interface IUserService
{
    IReadOnlyList<UserDto> GetAll();
    UserDto? GetById(long id);
    UserDto Create(UserCreateRequest request);
    UserDto? Update(long id, UserUpdateRequest request);
    UserDto? UpdateRole(long id, string roleName);
    UserDto? UpdateStatus(long id, bool status);
    bool Delete(long id);
    bool ResetPassword(long id, string newPassword);
}

public sealed class UserService(IAppRepository repository, IPasswordHasher hasher) : IUserService
{
    public IReadOnlyList<UserDto> GetAll() => repository.Users.Select(x => x.ToDto(repository)).ToList();

    public UserDto? GetById(long id)
    {
        var user = repository.FindUser(id);
        return user?.ToDto(repository);
    }

    public UserDto Create(UserCreateRequest request)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(request.Username) || request.Username.Trim().Length < 4 || request.Username.Trim().Length > 30)
            errors.Add("Username must be between 4 and 30 characters.");
        else if (!System.Text.RegularExpressions.Regex.IsMatch(request.Username.Trim(), @"^[a-zA-Z0-9_]+$"))
            errors.Add("Username can only contain letters, numbers, and underscores.");
        else if (repository.FindUser(request.Username.Trim()) is not null)
            errors.Add("Username already exists.");

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            errors.Add("Password must be at least 6 characters.");

        if (string.IsNullOrWhiteSpace(request.RoleName) || !(request.RoleName == "ADMIN" || request.RoleName == "MANAGER"))
            errors.Add("Role must be ADMIN or MANAGER.");

        if (string.IsNullOrWhiteSpace(request.FullName) || request.FullName.Trim().Length < 5 || request.FullName.Trim().Length > 100)
            errors.Add("Full name must be between 5 and 100 characters.");

        if (string.IsNullOrWhiteSpace(request.Email))
            errors.Add("Email is required.");
        else if (!System.Text.RegularExpressions.Regex.IsMatch(request.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            errors.Add("Email is not a valid email address.");
        else if (repository.Users.Any(u => u.Email == request.Email.Trim()))
            errors.Add("Email already exists.");

        if (errors.Count > 0)
            throw new InvalidOperationException(string.Join(" | ", errors));

        var role = repository.FindRole(request.RoleName) ?? throw new InvalidOperationException("Role not found.");
        var user = repository.AddUser(new User
        {
            Username = request.Username.Trim(),
            PasswordHash = hasher.Hash(request.Password),
            RoleId = role.RoleId,
            FullName = request.FullName?.Trim(),
            Email = request.Email?.Trim(),
            Status = true
        });
        return user.ToDto(repository);
    }

    public UserDto? Update(long id, UserUpdateRequest request)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(request.RoleName) || !(request.RoleName == "ADMIN" || request.RoleName == "MANAGER"))
            errors.Add("Role must be ADMIN or MANAGER.");

        if (string.IsNullOrWhiteSpace(request.FullName) || request.FullName.Trim().Length < 5 || request.FullName.Trim().Length > 100)
            errors.Add("Full name must be between 5 and 100 characters.");

        if (string.IsNullOrWhiteSpace(request.Email))
            errors.Add("Email is required.");
        else if (!System.Text.RegularExpressions.Regex.IsMatch(request.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            errors.Add("Email is not a valid email address.");
        else if (repository.Users.Any(u => u.Email == request.Email.Trim() && u.UserId != id))
            errors.Add("Email already exists.");

        if (errors.Count > 0)
            throw new InvalidOperationException(string.Join(" | ", errors));

        var user = repository.FindUser(id);
        var role = repository.FindRole(request.RoleName);
        if (user is null || role is null) return null;
        user.RoleId = role.RoleId;
        user.FullName = request.FullName?.Trim();
        user.Email = request.Email?.Trim();
        user.Status = request.Status;
        repository.UpdateUser(user);
        return user.ToDto(repository);
    }

    public UserDto? UpdateRole(long id, string roleName)
    {
        var user = repository.FindUser(id);
        var role = repository.FindRole(roleName);
        if (user is null || role is null) return null;
        user.RoleId = role.RoleId;
        repository.UpdateUser(user);
        return user.ToDto(repository);
    }

    public UserDto? UpdateStatus(long id, bool status)
    {
        var user = repository.FindUser(id);
        if (user is null) return null;
        user.Status = status;
        repository.UpdateUser(user);
        return user.ToDto(repository);
    }

    public bool Delete(long id)
    {
        if (repository.FindUser(id) is null) return false;
        repository.DeleteUser(id);
        return true;
    }

    public bool ResetPassword(long id, string newPassword)
    {
        var user = repository.FindUser(id);
        if (user is null) return false;
        user.PasswordHash = hasher.Hash(newPassword);
        repository.UpdateUser(user);
        return true;
    }
}
