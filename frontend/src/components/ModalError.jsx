import React from 'react';

const Modal = ({ message, onClose }) => {
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)', // Fondo más oscuro
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const contentStyle = {
    background: '#000', // Fondo negro para el contenido
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    width: '300px',
    textAlign: 'center',
    position: 'relative', // Para el posicionamiento del botón de cerrar
  };

  const titleStyle = {
    fontSize: '1.5em', // Título más grande
    marginBottom: '10px',
    color: '#ff0000', // Color rojo para el título
  };

  const messageStyle = {
    fontSize: '1em', // Tamaño de fuente del mensaje
    marginBottom: '20px', // Espaciado inferior
  };

  const buttonStyle = {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    background: '#007bff', // Color azul para el botón
    color: '#fff', // Color de texto blanco
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'background 0.3s', // Transición para el efecto hover
  };

  const buttonHoverStyle = {
    background: '#0056b3', // Color más oscuro para el hover
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={titleStyle}>Error</h2>
        <p style={messageStyle}>{message}</p>
        <button
          style={buttonStyle}
          onMouseOver={(e) => (e.currentTarget.style.background = buttonHoverStyle.background)}
          onMouseOut={(e) => (e.currentTarget.style.background = buttonStyle.background)}
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default Modal;
