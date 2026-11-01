import type { RemixiconComponentType } from '@remixicon/react'
import { RiFileList3Line, RiLockLine } from '@remixicon/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

/** Pages whose copy is supplied by legal rather than designed here. A named,
    honest placeholder beats a half-invented page. */
function Placeholder({
  title,
  description,
  icon,
  emptyTitle,
  emptyBody,
}: {
  title: string
  description: string
  icon: RemixiconComponentType
  emptyTitle: string
  emptyBody: string
}) {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: title }]}
        title={title}
        description={description}
      />
      <Card>
        <EmptyState icon={icon} title={emptyTitle} description={emptyBody} />
      </Card>
    </>
  )
}

export function Terms() {
  return (
    <Placeholder
      title="Terms of service"
      description="The agreement governing your use of the Sai Mobiles merchant console."
      icon={RiFileList3Line}
      emptyTitle="Terms of service"
      emptyBody="The current agreement will be published here with its effective date and revision history."
    />
  )
}

export function Privacy() {
  return (
    <Placeholder
      title="Privacy policy"
      description="What we collect, why we hold it, and how long we keep it."
      icon={RiLockLine}
      emptyTitle="Privacy policy"
      emptyBody="The current policy will be published here with its effective date and revision history."
    />
  )
}
