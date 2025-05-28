using System;

namespace DigitalContentPlatform.Core.Entities
{
    public class ServiceResult
    {
        public bool Success { get; }
        public string? Message { get; }
        public object? Data { get; }

        protected ServiceResult(bool success, string? message, object? data)
        {
            Success = success;
            Message = message;
            Data = data;
        }

        public static ServiceResult SuccessResult(object? data = null, string? message = null)
        {
            return new ServiceResult(true, message, data);
        }

        public static ServiceResult ErrorResult(string message)
        {
            return new ServiceResult(false, message, null);
        }
    }

    public class ServiceResult<T>
    {
        public bool IsSuccess { get; }
        public string? Message { get; }
        public T? Data { get; }

        protected ServiceResult(bool success, string? message, T? data)
        {
            IsSuccess = success;
            Message = message;
            Data = data;
        }

        public static ServiceResult<T> Success(T data, string? message = null)
        {
            return new ServiceResult<T>(true, message, data);
        }

        public static ServiceResult<T> Error(string message)
        {
            return new ServiceResult<T>(false, message, default);
        }
    }
}