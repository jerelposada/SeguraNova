using System.Security.Claims;
using Application.Abstractions.Authentication;
using Application.DTOs.Auth;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IAuthService authService) : ControllerBase
{
    [EnableRateLimiting("login")]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var response = await authService.LoginAsync(request, ct);
        if (response is null)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request, CancellationToken ct)
    {
        var response = await authService.RefreshAsync(request, ct);
        if (response is null)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        return Ok(response);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request, CancellationToken ct)
    {
        var subjectClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!Guid.TryParse(subjectClaim, out var userId))
        {
            return Unauthorized();
        }

        await authService.RevokeAsync(userId, request.RefreshToken, ct);
        return NoContent();
    }
}
