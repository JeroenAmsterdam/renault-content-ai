import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileQuestionIcon } from 'lucide-react'

export default function ArticleNotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <FileQuestionIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-secondary mb-2">
            Artikel niet gevonden
          </h2>
          <p className="text-gray-600 mb-6">
            Dit artikel bestaat niet of is verwijderd
          </p>
          <Link href="/articles">
            <Button className="bg-primary hover:bg-primary-dark text-white">
              Terug naar overzicht
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
