namespace BoxBox.Api.Domain.Exceptions;

public class DomainException : Exception
{
    public int StatusCode { get; }

    public DomainException(string message, int statusCode = 400) : base(message)
    {
        StatusCode = statusCode;
    }
}

public class UsernameAlreadyExistsException : DomainException
{
    public UsernameAlreadyExistsException()
        : base("Username already exists", 409) { }
}

public class InvalidCredentialsException : DomainException
{
    public InvalidCredentialsException()
        : base("Invalid username or password", 401) { }
}

public class UserNotFoundException : DomainException
{
    public UserNotFoundException()
        : base("User not found", 404) { }
}
