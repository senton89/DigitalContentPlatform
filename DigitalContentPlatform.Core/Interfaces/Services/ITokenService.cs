using DigitalContentPlatform.Core.Entities;

namespace DigitalContentPlatform.Core.Interfaces.Services
{
    public interface ITokenService
    {
        string CreateToken(User user);
    }
}
