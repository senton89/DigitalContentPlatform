public class SharedContent
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Url { get; set; } // ссылка на файл или изображение
    public string ContentType { get; set; } // например: image, video, document
    public DateTime CreatedAt { get; set; }
}