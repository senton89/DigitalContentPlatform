using DigitalContentPlatform.Core.DTOs.Auth;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Core.Interfaces.Services
{
    public interface IAuthService
    {
        Task<AuthResult> RegisterAsync(string username, string email, string password);
        Task<AuthResult> LoginAsync(string email, string password);
    }
}
