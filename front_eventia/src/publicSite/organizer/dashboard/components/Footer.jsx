const Footer = () => {
  return (
    <footer style={{
      padding: "10px 0",
      backgroundColor: "#f0f0f0",
      color: "#555",
      textAlign: "center",
      fontSize: 13,
      fontFamily: "'Lucida Console', sans-serif",
      userSelect: "none"
    }}>
      © {new Date().getFullYear()} EventIA
    </footer>
  );
};

export default Footer;
