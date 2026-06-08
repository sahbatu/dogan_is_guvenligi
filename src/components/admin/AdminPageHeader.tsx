import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface AdminPageHeaderProps {
  backTo: string
  backLabel: string
  title: string
  description?: string
}

export function AdminPageHeader({ backTo, backLabel, title, description }: AdminPageHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-navy-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-navy-900">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
    </div>
  )
}
