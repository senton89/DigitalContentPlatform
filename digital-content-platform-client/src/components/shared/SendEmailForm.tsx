import React, { useState } from 'react';
import './SendEmailForm.css';

interface SendEmailFormProps {
  url: string;
  itemName: string;
}

const SendEmailForm: React.FC<SendEmailFormProps> = ({ url, itemName }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:5268/api/Email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: email,
          subject: `Поделиться контентом: ${itemName}`,
          body: `
Здравствуйте!

${message}

🔗 Ссылка на контент: ${url}
`,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при отправке письма');
      }

      setSuccessMessage('Письмо успешно отправлено!');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Не удалось отправить письмо');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="send-email-form">
        <h4>Отправить по email</h4>
        {successMessage && <p className="success">{successMessage}</p>}
        {errorMessage && <p className="error">{errorMessage}</p>}

        <form onSubmit={handleSubmit}>
          <input
              type="email"
              placeholder="Email получателя"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
          />

          <textarea
              placeholder="Ваше сообщение"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Отправка...' : 'Отправить'}
          </button>
        </form>
      </div>
  );
};

export default SendEmailForm;