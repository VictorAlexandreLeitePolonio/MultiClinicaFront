'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useAuth } from '@/contexts/AuthContext'
import { usePatientAuth } from '@/contexts/PatientAuthContext'
import { logout } from '@/app/(public)/login/services/auth.service'
import { useRouter } from 'next/navigation'
import { SidebarLink } from './SidebarLink'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { getRoleLabel } from '@/lib/auth/routes'
import {
  Home,
  Users,
  Calendar,
  Activity,
  CreditCard,
  ClipboardList,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  BadgeCheck,
  Building2,
  Settings,
  Store,
  User,
  Receipt,
} from 'lucide-react'
import { getTenantTheme } from '@/utils/tenant'

export const baseModules = [
  {
    href: '/app',
    label: 'Início',
    icon: <Home size={18} />,
    roles: ['Administrador', 'Profissional', 'Recepcao'],
  },
  {
    href: '/app/pacientes',
    label: 'Pacientes',
    icon: <Users size={18} />,
    roles: ['Administrador', 'Profissional', 'Recepcao'],
  },
  {
    href: '/app/agenda',
    label: 'Agenda',
    icon: <Calendar size={18} />,
    roles: ['Administrador', 'Profissional', 'Recepcao'],
  },
  {
    href: '/app/fichas',
    label: 'Fichas de medição',
    icon: <Activity size={18} />,
    roles: ['Administrador', 'Profissional', 'Recepcao'],
  },
]

export const adminModules = [
  {
    href: '/app/pagamentos',
    label: 'Pagamentos',
    icon: <CreditCard size={18} />,
    roles: ['Administrador', 'Recepcao'],
  },
  {
    href: '/app/financeiro',
    label: 'Balanço',
    icon: <BarChart2 size={18} />,
    roles: ['Administrador'],
  },
  {
    href: '/app/usuarios',
    label: 'Usuários',
    icon: <Shield size={18} />,
    roles: ['Administrador'],
  },
  {
    href: '/app/planos',
    label: 'Planos',
    icon: <ClipboardList size={18} />,
    roles: ['Administrador'],
  },
]

export const settingsModule = {
  href: '/app/configuracoes',
  label: 'Configurações',
  icon: <Settings size={18} />,
  permission: 'clinic.settings.view',
}

const superAdminModules = [
  { href: '/superadmin', label: 'Dashboard', icon: <Home size={18} /> },
  {
    href: '/superadmin/clinicas',
    label: 'Clínicas',
    icon: <Building2 size={18} />,
  },
  {
    href: '/superadmin/aprovacoes',
    label: 'Aprovações do hub',
    icon: <BadgeCheck size={18} />,
  },
  {
    href: '/superadmin/cobrancas',
    label: 'Cobranças',
    icon: <CreditCard size={18} />,
  },
  {
    href: '/superadmin/historico',
    label: 'Histórico',
    icon: <ClipboardList size={18} />,
  },
]

const patientModules = [
  { href: '/paciente', label: 'Início', icon: <Home size={18} /> },
  { href: '/paciente/consultas', label: 'Consultas', icon: <Calendar size={18} /> },
  { href: '/paciente/cobrancas', label: 'Cobranças', icon: <Receipt size={18} /> },
  { href: '/paciente/solicitacoes', label: 'Solicitações', icon: <ClipboardList size={18} /> },
  { href: '/paciente/clinicas', label: 'Minhas clínicas', icon: <Building2 size={18} /> },
  { href: '/paciente/marketplace', label: 'Marketplace', icon: <Store size={18} /> },
  { href: '/paciente/perfil', label: 'Meu perfil', icon: <User size={18} /> },
]

interface SidebarProps {
  area: 'clinic' | 'superadmin' | 'patient'
}

export function Sidebar({ area }: SidebarProps) {
  const { user, tenant, setUser, can } = useAuth()
  const { patient, logout: patientLogout } = usePatientAuth()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const reduceMotion = useReducedMotion()

  const isPatient = area === 'patient'
  const clinicModules = [...baseModules, ...adminModules].filter((module) =>
    user ? module.roles.includes(user.role) : false,
  )
  const clinicName = tenant?.displayName?.trim() || 'Cliniq'
  const tenantTheme = getTenantTheme(tenant)
  const modules = area === 'superadmin' ? superAdminModules : isPatient ? patientModules : clinicModules

  const handleLogout = async () => {
    if (isPatient) {
      try {
        setIsLoggingOut(true)
        await patientLogout()
      } finally {
        router.replace('/paciente/login')
        setIsLoggingOut(false)
      }
      return
    }
    try {
      setIsLoggingOut(true)
      await logout()
    } finally {
      setUser(null)
      router.replace('/login')
      setIsLoggingOut(false)
    }
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 25 }}
      className={`sticky top-0 h-screen flex-col overflow-hidden border-r border-[var(--color-gray-200)] bg-[var(--color-card)] px-3 py-6 ${isPatient ? 'hidden md:flex' : 'flex'}`}
    >
      {/* Logo + botão colapsar */}
      <div
        className={`mb-2 flex shrink-0 items-center px-1 ${collapsed ? 'justify-center' : 'justify-between'}`}
      >
        {!collapsed && (
          <div className="flex flex-col items-center gap-2 w-full">
            {isPatient || area === 'superadmin' ? (
              <BrandLogo variant="mark" size={56} className="rounded-2xl" priority />
            ) : (
              <div
                className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[var(--color-gray-200)] text-[var(--color-white)] shadow-[var(--shadow-teal-sm)]"
                style={{ backgroundColor: tenantTheme.primaryColor }}
              >
                {tenant?.logoUrl ? (
                  <img
                    src={tenant.logoUrl}
                    alt={clinicName}
                    className="h-full w-full object-contain p-1.5"
                  />
                ) : (
                  <Building2 size={28} />
                )}
              </div>
            )}
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-secondary)]">
                {isPatient ? 'Cliniq' : area === 'superadmin' ? 'Cliniq' : clinicName}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)]">
                {isPatient ? 'Portal do Paciente' : area === 'superadmin' ? 'Painel Global' : 'App Clínica'}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className={`rounded-xl border border-transparent p-1.5 text-[var(--color-gray-600)] transition-colors hover:bg-[var(--color-primary-muted)] hover:text-[var(--color-primary-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${collapsed ? '' : 'ml-auto'}`}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Separador */}
      <div className="mx-2 my-3 h-px shrink-0 bg-[var(--color-gray-200)]" />

      {/* Módulos */}
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain">
        {modules.map((mod) => (
          <SidebarLink key={mod.href} {...mod} collapsed={collapsed} />
        ))}
        {area === 'clinic' && can(settingsModule.permission) && (
          <SidebarLink {...settingsModule} collapsed={collapsed} />
        )}
      </nav>

      {/* Divisor */}
      <div className="mx-2 my-4 h-px shrink-0 bg-[var(--color-gray-200)]" />

      {!collapsed && !isPatient && user && (
        <div className="mb-3 shrink-0 rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-gray-50)] px-3 py-2 shadow-[var(--shadow-sm)]">
          <p className="truncate text-xs font-semibold text-[var(--color-secondary)]">
            {user.name}
          </p>
          <p className="truncate text-[11px] text-[var(--color-gray-600)]">
            {getRoleLabel(user.role)}
          </p>
        </div>
      )}

      {!collapsed && isPatient && patient && (
        <div className="mb-3 shrink-0 rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-gray-50)] px-3 py-2 shadow-[var(--shadow-sm)]">
          <p className="truncate text-xs font-semibold text-[var(--color-secondary)]">
            {patient.name ?? 'Paciente'}
          </p>
          <p className="truncate text-[11px] text-[var(--color-gray-600)]">
            {patient.email ?? 'Paciente'}
          </p>
        </div>
      )}

      {isPatient && (
        <div className={`mb-2 flex shrink-0 items-center ${collapsed ? 'justify-center' : 'justify-between px-1'}`}>
          {!collapsed && (
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-gray-600)]">
              Tema
            </span>
          )}
          <ThemeToggle />
        </div>
      )}

      {/* Sair */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`flex shrink-0 items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold
          text-[var(--color-gray-600)] transition-[color,background-color] duration-[160ms] hover:bg-red-50 hover:text-red-600 active:scale-[0.97] disabled:cursor-wait disabled:opacity-60 dark:hover:bg-red-950/30 dark:hover:text-red-300
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] motion-reduce:transition-none motion-reduce:active:scale-100
          ${collapsed ? 'justify-center' : ''}`}
        title={collapsed ? 'Sair' : undefined}
      >
        <LogOut size={18} />
        {!collapsed && <span>Sair</span>}
      </button>
    </motion.aside>
  )
}
