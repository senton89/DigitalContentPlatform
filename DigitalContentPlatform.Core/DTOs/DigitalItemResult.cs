// DigitalContentPlatform.Core/DTOs/DigitalItemResult.cs
using System;

namespace DigitalContentPlatform.Core.DTOs
{
    public class DigitalItemResult
    {
        public bool Success { get; set; }
        public Guid Id { get; set; }
        public string Message { get; set; }
    }
}
