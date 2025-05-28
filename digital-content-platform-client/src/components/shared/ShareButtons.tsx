// src/components/shared/ShareButtons.tsx
import React, {useState} from 'react';
import './ShareButtons.css';
import { FaVk } from 'react-icons/fa';
import { FaTelegramPlane } from 'react-icons/fa';
import { FaWhatsapp } from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';
import SendEmailForm from "./SendEmailForm";
interface ShareButtonsProps {
  url: string;
  title: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ url, title }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      alert('Ссылка скопирована в буфер обмена');
    });
  };

  return (
      <div className="share-buttons">
        <h4>Поделиться:</h4>
        <ul className="share-list">
          {/* VK */}
          <li className="share-item">
            <a
                href={`https://vk.com/share.php?url= ${encodedUrl}&title=${encodedTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Поделиться ВКонтакте"
                className="share-link vk"
            >
              {/*@ts-ignore*/}
              <FaVk /> ВКонтакте
            </a>
          </li>

          {/* Telegram */}
          <li className="share-item">
            <a
                href={`https://t.me/share/url?url= ${encodedUrl}&text=${encodedTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Поделиться в Telegram"
                className="share-link telegram"
            >
              {/*@ts-ignore*/}
              <FaTelegramPlane /> Telegram
            </a>
          </li>

          {/* WhatsApp */}
          <li className="share-item">
            <a
                href={`whatsapp://send?text=${encodedTitle}%20${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Поделиться в WhatsApp"
                className="share-link whatsapp"
            >
              {/*@ts-ignore*/}
              <FaWhatsapp /> WhatsApp
            </a>
          </li>

          {/* Email href={`mailto:?subject=${encodedTitle}&body=${encodedTitle}: ${encodedUrl}`}
          {/* Email */}
          <li className="share-item">
            <button onClick={() => setShowEmailForm(!showEmailForm)}>
              {showEmailForm ? 'Скрыть' : '📧 Отправить по email'}
            </button>
          </li>

          {/* Копировать ссылку */}
          <li className="share-item">
            <button onClick={handleCopyLink} className="copy-button" type="button">
              📋 Копировать ссылку
            </button>
          </li>

          {showEmailForm && (
              <SendEmailForm url={url} itemName={title} />
          )}
        </ul>
      </div>
  );
};

export default ShareButtons;