import { useNavigate, useLocation } from 'react-router-dom';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const scrollTo = (id: string) => {
    if (isHome) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollTo: id } });
    }
  };

  const goHome = () => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 64,
        background: 'rgba(255,255,255,0.80)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      <span
        onClick={goHome}
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: '#1d1d1f',
          letterSpacing: -0.3,
          textDecoration: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <img src="/hd-logo.webp" alt="" style={{ height: 36, width: 'auto', display: 'block' }} />
        恒迪视讯
      </span>
      <ul
        style={{
          display: 'flex',
          gap: 28,
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        <li>
          <span
            onClick={goHome}
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: 'rgba(0,0,0,0.72)',
              textDecoration: 'none',
              letterSpacing: -0.1,
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#1d1d1f')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(0,0,0,0.72)')}
          >
            首页
          </span>
        </li>
        <li>
          <span
            onClick={() => scrollTo('products')}
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: 'rgba(0,0,0,0.72)',
              textDecoration: 'none',
              letterSpacing: -0.1,
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#1d1d1f')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(0,0,0,0.72)')}
          >
            产品
          </span>
        </li>
        <li>
          <span
            onClick={() => scrollTo('cases')}
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: 'rgba(0,0,0,0.72)',
              textDecoration: 'none',
              letterSpacing: -0.1,
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#1d1d1f')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(0,0,0,0.72)')}
          >
            案例
          </span>
        </li>
        <li>
          <span
            onClick={() => scrollTo('about')}
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: 'rgba(0,0,0,0.72)',
              textDecoration: 'none',
              letterSpacing: -0.1,
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#1d1d1f')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(0,0,0,0.72)')}
          >
            关于我们
          </span>
        </li>
      </ul>
      <span
        onClick={() => scrollTo('footer')}
        style={{
          fontSize: 14,
          color: '#0066cc',
          textDecoration: 'none',
          letterSpacing: -0.1,
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
      >
        咨询热线
      </span>
    </nav>
  );
}
