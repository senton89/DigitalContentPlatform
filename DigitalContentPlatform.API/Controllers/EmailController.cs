// Controllers/EmailController.cs
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.Mail;

[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    [HttpPost("send")]
    public async Task<IActionResult> Send([FromBody] EmailRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var client = new SmtpClient("mail.smtp2go.com")
            {
                Port = 2525,
                Credentials = new NetworkCredential("digitalcontentplatform.com", "bQq4yM6UDTShfVxm"),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress("vobix@digitalcontentplatform.work.gd", "Digital Content Platform"),
                Subject = request.Subject,
                Body = request.Body,
                IsBodyHtml = false,
            };

            mailMessage.To.Add(request.To);

            await client.SendMailAsync(mailMessage);

            return Ok(new { message = "Письмо успешно отправлено." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ошибка при отправке email.", error = ex.Message });
        }
    }
}

public class EmailRequest
{
    public string To { get; set; }
    public string Subject { get; set; }
    public string Body { get; set; }
}