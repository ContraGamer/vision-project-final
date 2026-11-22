import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', icon: 'bx-image-add', name: 'Clasificar' },
  { to: '/evaluar', icon: 'bx-bar-chart-alt-2', name: 'Evaluar modelo' },
  { to: '/modelo', icon: 'bx-info-circle', name: 'Sobre el modelo' },
]

export function Sidebar({ isOpen, onToggle }) {
  return (
    <div className={`sidebar${isOpen ? ' active' : ''}`}>
      <div className="logo-content">
        <div className="logo"><i className="bx bx-recycle" style={{ fontSize: 26 }} /><div className="logo-name">Residuos IA</div></div>
        <i className="bx bx-menu" id="btn" style={{ fontSize: 26 }} onClick={onToggle} />
      </div>
      <ul className="nav-list">
        {items.map((i) => (
          <li key={i.to}>
            <NavLink to={i.to} end className={({ isActive }) => (isActive ? 'active-link' : '')}>
              <i className={`bx ${i.icon}`} /><span className="links-name">{i.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
