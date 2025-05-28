using Microsoft.AspNetCore.Http;

public class SharedContentDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Url { get; set; }
    public string ContentType { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSharedContentDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public IFormFile File { get; set; }
}