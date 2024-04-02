interface NavLinkProps {
  children: React.ReactNode
}

export function NavLink(props: NavLinkProps) {
  return <a href='' className='font-medium text-sm'>{props.children}</a>
}