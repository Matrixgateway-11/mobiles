import { Link } from 'react-router-dom'
import { RiCompass3Line } from '@remixicon/react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <Card>
      <EmptyState
        icon={RiCompass3Line}
        title="That page doesn't exist"
        description="The link may be out of date, or the section may not be enabled on your account."
        action={
          <Button as={Link} to="/dashboard" variant="primary">
            Back to dashboard
          </Button>
        }
      />
    </Card>
  )
}
