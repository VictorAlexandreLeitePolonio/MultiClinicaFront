'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageHeader } from '@/components/ui/PageHeader'
import { FormSection } from '@/components/ui/FormSection'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import {
  PagamentoCreateSchema,
  PagamentoCreateFormData,
} from '../schemas/pagamento.schema'
import { usePagamentoInsert } from '../hooks/insert'
import { usePlanos } from '../hooks/usePlanos'
import { Patient } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { getPatients } from '@/app/(authenticated)/app/pacientes/services/patients.service'
import { useMercadoPagoStatus } from '@/app/(authenticated)/app/configuracoes/hooks/useMercadoPago'
import {
  MANUAL_PAYMENT_METHODS,
  ONLINE_PAYMENT_METHOD,
} from '../paymentMethods'

interface Props {
  onBack: () => void
  onSave: () => void
}

type BillingMode = 'manual' | 'online'

const paymentStatusOptions = [
  { value: 'Pending', label: 'Pendente' },
  { value: 'Paid', label: 'Pago' },
  { value: 'Cancelled', label: 'Cancelado' },
]

const fieldClassName =
  'w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-secondary dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all'

export default function PagamentoRegister({ onBack, onSave }: Props) {
  const { user } = useAuth()
  const { insertPagamento, isPending } = usePagamentoInsert()
  const { data: planos, loading: loadingPlanos } = usePlanos()
  const mercadoPago = useMercadoPagoStatus()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [billingMode, setBillingMode] = useState<BillingMode>('manual')
  const [sendOnline, setSendOnline] = useState(true)

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PagamentoCreateFormData>({
    resolver: zodResolver(PagamentoCreateSchema),
    defaultValues: {
      patientId: 0,
      planId: 0,
      referenceMonth: '',
      paymentMethod: '',
      status: 'Pending',
      paymentDate: null,
      sendOnline: false,
    },
  })

  const status = watch('status')
  const patientId = watch('patientId')
  const planId = watch('planId')
  const referenceMonth = watch('referenceMonth')
  const paymentMethod = watch('paymentMethod')
  const paymentDate = watch('paymentDate')

  const selectedPlan = planos.find((p) => p.id === planId)
  const selectedPatient = patients.find((p) => p.id === patientId)
  const patientHasEmail = Boolean(selectedPatient?.email?.trim())
  const onlineAvailable = Boolean(
    !mercadoPago.isError &&
      mercadoPago.data?.connected &&
      !mercadoPago.data.revoked,
  )
  const isOnline = billingMode === 'online' && onlineAvailable

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

  // Se a conta for desconectada (ou o plano deixar de permitir), volta para Manual.
  useEffect(() => {
    if (!onlineAvailable && billingMode === 'online') {
      setBillingMode('manual')
      setValue('paymentMethod', '', { shouldValidate: true })
      setValue('status', 'Pending', { shouldValidate: true })
      setValue('paidAt', '')
    }
  }, [onlineAvailable, billingMode, setValue])

  // A caixa começa marcada sempre que o paciente escolhido tem e-mail.
  useEffect(() => {
    if (isOnline) setSendOnline(patientHasEmail)
  }, [isOnline, patientId, patientHasEmail])

  const handleBillingModeChange = (mode: BillingMode) => {
    setBillingMode(mode)
    if (mode === 'online') {
      setValue('paymentMethod', ONLINE_PAYMENT_METHOD, {
        shouldValidate: true,
      })
      setValue('status', 'Pending', { shouldValidate: true })
      setValue('paidAt', '')
    } else {
      setValue('paymentMethod', '', { shouldValidate: true })
      setValue('status', 'Pending', { shouldValidate: true })
    }
  }

  const onSubmit = async (data: PagamentoCreateFormData) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado. Faça login novamente.')
      return
    }

    const willSendOnline = isOnline && patientHasEmail && sendOnline

    try {
      await insertPagamento({
        ...data,
        paymentMethod: isOnline ? ONLINE_PAYMENT_METHOD : data.paymentMethod,
        status: isOnline ? 'Pending' : data.status,
        sendOnline: willSendOnline,
        responsavelId: user.id,
      })
      toast.success(
        willSendOnline
          ? 'Cobrança criada e enviada por e-mail.'
          : 'Pagamento cadastrado com sucesso!',
      )
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
              htmlFor="patientId"
              className="text-sm font-semibold text-secondary dark:text-white uppercase tracking-wider"
            >
              Paciente *
            </label>
            <select
              id="patientId"
              value={patientId || 0}
              onChange={(e) =>
                setValue('patientId', Number(e.target.value), {
                  shouldValidate: true,
                })
              }
              className={fieldClassName}
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
              htmlFor="planId"
              className="text-sm font-semibold text-secondary dark:text-white uppercase tracking-wider"
            >
              Plano *
            </label>
            <select
              id="planId"
              value={planId || 0}
              onChange={(e) =>
                setValue('planId', Number(e.target.value), {
                  shouldValidate: true,
                })
              }
              className={fieldClassName}
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
            type="date"
            error={errors.referenceMonth?.message}
            value={referenceMonth || ''}
            onChange={(e) =>
              setValue('referenceMonth', e.target.value, {
                shouldValidate: true,
              })
            }
          />

          {/* Como será pago? Online só aparece com Mercado Pago conectado. */}
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-semibold text-secondary dark:text-white uppercase tracking-wider">
              Como será pago? *
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {onlineAvailable && (
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                    isOnline
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                  }`}
                >
                  <input
                    type="radio"
                    name="billingMode"
                    value="online"
                    checked={isOnline}
                    onChange={() => handleBillingModeChange('online')}
                    className="mt-1 h-4 w-4 accent-[#14b8a6]"
                  />
                  <span className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-secondary dark:text-white">
                      Online (Mercado Pago)
                    </span>
                    <span className="text-xs text-gray-600 dark:text-slate-400">
                      O paciente recebe o link para pagar por Pix ou cartão.
                    </span>
                  </span>
                </label>
              )}
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                  !isOnline
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                }`}
              >
                <input
                  type="radio"
                  name="billingMode"
                  value="manual"
                  checked={!isOnline}
                  onChange={() => handleBillingModeChange('manual')}
                  className="mt-1 h-4 w-4 accent-[#14b8a6]"
                />
                <span className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-secondary dark:text-white">
                    Manual
                  </span>
                  <span className="text-xs text-gray-600 dark:text-slate-400">
                    Registre um pagamento já recebido.
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          {isOnline ? (
            <div className="flex flex-col gap-2">
              <label
                className={`flex items-start gap-3 rounded-xl border p-4 ${
                  patientHasEmail
                    ? 'border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                    : 'border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={sendOnline && patientHasEmail}
                  disabled={!patientHasEmail}
                  onChange={(e) => setSendOnline(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#14b8a6] disabled:cursor-not-allowed"
                />
                <span className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-secondary dark:text-white">
                    Enviar cobrança por e-mail ao salvar
                  </span>
                  {!patientHasEmail && patientId > 0 && (
                    <span className="text-xs text-gray-600 dark:text-slate-400">
                      Cadastre o e-mail do paciente para enviar por e-mail. O
                      link pode ser copiado depois na lista.
                    </span>
                  )}
                </span>
              </label>
            </div>
          ) : (
            <>
              {/* Select de Forma de Pagamento */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="paymentMethod"
                  className="text-sm font-semibold text-secondary dark:text-white uppercase tracking-wider"
                >
                  Forma de pagamento *
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod || ''}
                  onChange={(e) =>
                    setValue('paymentMethod', e.target.value, {
                      shouldValidate: true,
                    })
                  }
                  className={fieldClassName}
                >
                  <option value="">Selecione uma forma</option>
                  {MANUAL_PAYMENT_METHODS.map((method) => (
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
                  htmlFor="status"
                  className="text-sm font-semibold text-secondary dark:text-white uppercase tracking-wider"
                >
                  Status *
                </label>
                <select
                  id="status"
                  value={status || 'Pending'}
                  onChange={(e) =>
                    setValue(
                      'status',
                      e.target.value as 'Pending' | 'Paid' | 'Cancelled',
                      { shouldValidate: true },
                    )
                  }
                  className={fieldClassName}
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
            </>
          )}

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
          {!isOnline && status === 'Paid' && (
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
