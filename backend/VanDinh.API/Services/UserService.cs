using VanDinh.API.DTOs;
using VanDinh.API.Models;
using VanDinh.API.Repositories;

namespace VanDinh.API.Services;

public interface IUserService
{
    IReadOnlyList<UserDto> GetAll();
    UserDto Create(UserCreateRequest request);
    UserDto? Update(long id, UserUpdateRequest request);
    bool Delete(long id);
    bool ResetPassword(long id, string newPassword);
}

public sealed class UserService(IAppRepository repository, IPasswordHasher hasher) : IUserService
{
    public IReadOnlyList<UserDto> GetAll() => repository.Users.Select(x => x.ToDto(repository)).ToList();

    public UserDto Create(UserCreateRequest request)
    {
        if (repository.FindUser(request.Username) is not null) throw new InvalidOperationException("Username already exists.");
        var role = repository.FindRole(request.RoleName) ?? throw new InvalidOperationException("Role not found.");
        var user = repository.AddUser(new User
        {
            Username = request.Username,
            PasswordHash = hasher.Hash(request.Password),
            RoleId = role.RoleId,
            FullName = request.FullName,
            Email = request.Email,
            Status = true
        });
        return user.ToDto(repository);
    }

    public UserDto? Update(long id, UserUpdateRequest request)
    {
        var user = repository.FindUser(id);
        var role = repository.FindRole(request.RoleName);
        if (user is null || role is null) return null;
        user.RoleId = role.RoleId;
        user.FullName = request.FullName;
        user.Email = request.Email;
        user.Status = request.Status;
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
