'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageHeader } from '@/components/ui/PageHeader'
import { FormSection } from '@/components/ui/FormSection'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { PagamentoSchema, PagamentoFormData } from '../schemas/pagamento.schema'
import { usePagamentoInsert } from '../hooks/insert'
import { usePlanos } from '../hooks/usePlanos'
import { Patient } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { maskMonthReference } from '@/utils/masks'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { getPatients } from '@/services/patients/patients.service'

interface Props {
  onBack: () => void
  onSave: () => void
}

const paymentStatusOptions = [
  { value: 'Pending', label: 'Pendente' },
  { value: 'Paid', label: 'Pago' },
  { value: 'Cancelled', label: 'Cancelado' },
]

const paymentMethodOptions = [
  'Dinheiro',
  'Cartão',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Pix',
  'Boleto',
  'Transferência',
]

export default function PagamentoRegister({ onBack, onSave }: Props) {
  const { user } = useAuth()
  const { insertPagamento, isPending } = usePagamentoInsert()
  const { data: planos, loading: loadingPlanos } = usePlanos()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(false)

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PagamentoFormData>({
    resolver: zodResolver(PagamentoSchema),
    defaultValues: {
      patientId: 0,
      planId: 0,
      referenceMonth: '',
      paymentMethod: '',
      status: 'Pending',
      paymentDate: null,
    },
  })

  const status = watch('status')
  const patientId = watch('patientId')
  const planId = watch('planId')
  const referenceMonth = watch('referenceMonth')
  const paymentMethod = watch('paymentMethod')
  const paymentDate = watch('paymentDate')

  const selectedPlan = planos.find((p) => p.id === planId)

  useEffect(() => {
    const fetchPatients = async () => {
      setLoadingPatients(true)
      try {
        const result = await getPatients()
        setPatients(result.data)
      } catch {
        // erro silencioso
      } finally {
        setLoadingPatients(false)
      }
    }
    fetchPatients()
  }, [])

  const onSubmit = async (data: PagamentoFormData) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado. Faça login novamente.')
      return
    }
    try {
      await insertPagamento({ ...data, responsavelId: user.id })
      toast.success('Pagamento cadastrado com sucesso!')
      onSave()
    } catch {
      // erro já tratado no hook
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Novo Pagamento" onBack={onBack} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Dados do Pagamento">
          {/* Select de Paciente */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-secondary dark:text-white uppercase tracking-wider"
            >
              Paciente *
            </label>
            <select
              value={patientId || 0}
              onChange={(e) =>
                setValue('patientId', Number(e.target.value), {
                  shouldValidate: true,
                })
              }
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-secondary dark:text-white
                focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
            >
              <option value={0}>
                {loadingPatients ? 'Carregando...' : 'Selecione um paciente'}
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.patientId && (
              <span className="text-xs text-red-600">
                {errors.patientId.message}
              </span>
            )}
          </div>

          {/* Select de Plano */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-secondary dark:text-white uppercase tracking-wider"
            >
              Plano *
            </label>
            <select
              value={planId || 0}
              onChange={(e) =>
                setValue('planId', Number(e.target.value), {
                  shouldValidate: true,
                })
              }
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-secondary dark:text-white
                focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
            >
              <option value={0}>
                {loadingPlanos ? 'Carregando...' : 'Selecione um plano'}
              </option>
              {planos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.planId && (
              <span className="text-xs text-red-600">
                {errors.planId.message}
              </span>
            )}
          </div>

          {/* Preview do valor do plano */}
          {selectedPlan && (
            <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
              <p className="text-sm text-gray-600 dark:text-slate-300">
                Valor do plano:
              </p>
              <p className="text-2xl font-bold text-primary-dark">
                {formatCurrency(selectedPlan.valor)}
              </p>
            </div>
          )}

          <FormField
            label="Mês de Referência *"
            id="referenceMonth"
            placeholder="01-2024"
            error={errors.referenceMonth?.message}
            value={referenceMonth || ''}
            onChange={(e) =>
              setValue('referenceMonth', maskMonthReference(e.target.value), {
                shouldValidate: true,
              })
            }
          />

          {/* Select de Método de Pagamento */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-secondary dark:text-white uppercase tracking-wider"
            >
              Método de Pagamento *
            </label>
            <select
              value={paymentMethod || ''}
              onChange={(e) =>
                setValue('paymentMethod', e.target.value, {
                  shouldValidate: true,
                })
              }
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-secondary dark:text-white
                focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
            >
              <option value="">Selecione um método</option>
              {paymentMethodOptions.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            {errors.paymentMethod && (
              <span className="text-xs text-red-600">
                {errors.paymentMethod.message}
              </span>
            )}
          </div>

          {/* Select de Status */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-secondary dark:text-white uppercase tracking-wider"
            >
              Status *
            </label>
            <select
              value={status || 'Pending'}
              onChange={(e) =>
                setValue(
                  'status',
                  e.target.value as 'Pending' | 'Paid' | 'Cancelled',
                  { shouldValidate: true },
                )
              }
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-secondary dark:text-white
                focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
            >
              {paymentStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <span className="text-xs text-red-600">
                {errors.status.message}
              </span>
            )}
          </div>

          {/* Data de Vencimento (opcional) */}
          <FormField
            label="Data de Vencimento (opcional)"
            id="paymentDate"
            type="date"
            value={paymentDate || ''}
            onChange={(e) => {
              const value = e.target.value
              setValue('paymentDate', value ? value : null, {
                shouldValidate: true,
              })
            }}
          />

          {/* Data de Pagamento (apenas se status for Pago) */}
          {status === 'Paid' && (
            <FormField
              label="Data do Pagamento"
              id="paidAt"
              type="date"
              onChange={(e) =>
                setValue('paidAt', e.target.value, { shouldValidate: true })
              }
            />
          )}
        </FormSection>

        <Button type="submit" loading={isPending}>
          Cadastrar
        </Button>
      </form>
    </div>
  )
}
