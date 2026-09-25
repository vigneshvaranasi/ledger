import Link from 'next/link'
import type { ReactNode } from 'react'
import Image from 'next/image'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  Cloud,
  Database,
  ExternalLink,
  GitFork,
  ShieldCheck,
  Sparkles,
  Terminal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PublicAiDemo } from '@/components/public-ai-demo'

export function PublicHeader() {
  return (
    <header className='flex items-center justify-between border-b px-4 py-4 sm:px-8'>
      <Link href='/' className='text-lg font-semibold tracking-tight'>Ledger</Link>
      <nav className='flex items-center gap-1 text-sm'>
        <Button asChild variant='ghost' size='sm'>
          <Link href='/docs'>Docs</Link>
        </Button>
      </nav>
    </header>
  )
}

export function HomePage() {
  return (
    <main className='min-h-svh bg-background'>
      <PublicHeader />
      <section className='border-b'>
        <div className='mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-8 sm:pb-32 sm:pt-32'>
          <p className='mb-8 text-sm font-medium text-primary'>A personal ledger for a more intentional life.</p>
          <h1 className='max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-7xl'>
            Spend with clarity.
            <span className='block text-muted-foreground'>Keep your data yours.</span>
          </h1>
          <div className='mt-10 grid max-w-4xl gap-8 sm:grid-cols-[1fr_0.8fr] sm:items-end'>
            <p className='text-xl leading-8 text-muted-foreground'>
              Ledger gives you a quiet, useful place to understand your expenses.
            </p>
            <div className='flex flex-wrap gap-3 sm:justify-end'>
              <Button asChild size='lg'><Link href='/docs'>Get started <ArrowRight /></Link></Button>
            </div>
          </div>
        </div>
      </section>

      <section className='border-b'>
        <div className='mx-auto grid max-w-6xl divide-y px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8'>
          {[
            ['01', 'Your own data', 'Stored in the Notion workspace you choose.'],
            ['02', 'Your own deployment', 'Run Ledger on the hosting platform you choose.'],
            ['03', 'Your own rules', 'Choose the services and settings that fit your workflow.'],
          ].map(([number, title, description]) => (
            <div key={number} className='py-8 sm:px-8 sm:first:pl-0 sm:last:pr-0'>
              <p className='text-xs font-medium text-primary'>{number}</p>
              <h2 className='mt-4 font-semibold'>{title}</h2>
              <p className='mt-2 text-sm leading-6 text-muted-foreground'>{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id='how-it-works' className='border-b'>
        <div className='mx-auto max-w-6xl px-4 py-24 sm:px-8'>
          <div className='max-w-xl'>
            <p className='text-sm font-medium text-primary'>How it works</p>
            <h2 className='mt-4 text-4xl font-semibold tracking-tight sm:text-5xl'>Simple from the first step.</h2>
            <p className='mt-5 text-lg leading-8 text-muted-foreground'>Ledger is designed to fit into the tools you already use, not ask you to move your life into another platform.</p>
          </div>
          <div className='mt-14 grid gap-10 sm:grid-cols-3'>
            {[
              ['01', 'Connect Notion', 'Create a database for your expenses and give Ledger access to it.'],
              ['02', 'Deploy Ledger', 'Add your environment values and deploy your private app wherever you prefer.'],
              ['03', 'Build awareness', 'Record expenses, review patterns, and make better decisions over time.'],
            ].map(([number, title, description]) => (
              <div key={number} className='border-t pt-5'>
                <p className='text-sm text-muted-foreground'>{number}</p>
                <h3 className='mt-8 text-xl font-semibold'>{title}</h3>
                <p className='mt-3 leading-7 text-muted-foreground'>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id='privacy' className='border-b bg-muted/30'>
        <div className='mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center'>
          <div>
            <p className='text-sm font-medium text-primary'>Privacy, by design</p>
            <h2 className='mt-4 text-4xl font-semibold tracking-tight sm:text-5xl'>Your data stays where you put it.</h2>
          </div>
          <div className='space-y-6 text-lg leading-8 text-muted-foreground'>
            <p>Ledger does not run a central database for your expenses. You connect it to your Notion workspace and deploy the app to infrastructure you control.</p>
            <p>There is no Ledger account and no financial profile held by us. You choose the storage, the deployment, the password, and the services used by your setup.</p>
            <div className='grid gap-3 pt-2 text-sm text-foreground sm:grid-cols-2'>
              {['Your Notion workspace', 'Your hosting environment', 'Your access password', 'Your configuration'].map((item) => (
                <div key={item} className='flex items-center gap-2'><Check className='size-4 text-primary' />{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className='border-b'>
        <div className='mx-auto max-w-6xl px-4 py-24 sm:px-8'>
          <div className='max-w-3xl'>
            <p className='text-sm font-medium text-primary'>AI-powered expense logging</p>
            <h2 className='mt-4 text-4xl font-semibold tracking-tight sm:text-5xl'>Describe your expenses. Ledger does the organizing.</h2>
            <p className='mt-5 max-w-2xl text-lg leading-8 text-muted-foreground'>
              Tell Ledger what you spent in your own words. It recognizes each expense,
              amount, category, payment method, and date, then prepares everything as
              structured drafts for you to review.
            </p>
          </div>
          <div className='mt-12'>
            <PublicAiDemo />
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-6xl px-4 py-24 sm:px-8'>
        <div className='mb-10 max-w-2xl'>
          <p className='text-sm font-medium text-primary'>Made for daily use</p>
          <h2 className='mt-3 text-4xl font-semibold tracking-tight sm:text-5xl'>The useful parts, in one place.</h2>
        </div>
        <div className='grid gap-x-10 gap-y-12 sm:grid-cols-2'>
          {[
            [BarChart3, 'See the bigger picture', 'Understand spending over time with totals, trends, categories, and recent activity.'],
            [ShieldCheck, 'Keep it private', 'Protect the dashboard with your own password and keep the deployment under your control.'],
            [Sparkles, 'Log expenses naturally', 'Describe one expense or several at once. Ledger turns your words into clear, reviewable entries.'],
            [BookOpen, 'Make it yours', 'Start with the setup guide, then adapt the database and environment to fit your habits.'],
          ].map(([Icon, title, description]) => (
            <div key={title as string} className='border-t pt-5'>
              <Icon className='mb-8 size-5 text-primary' />
              <h2 className='font-semibold'>{title as string}</h2>
              <p className='mt-3 max-w-md leading-7 text-muted-foreground'>{description as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='border-t bg-muted/30'>
        <div className='mx-auto max-w-6xl px-4 py-24 sm:px-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <p className='text-sm font-medium text-primary'>See Ledger in action</p>
            <h2 className='mt-3 text-4xl font-semibold tracking-tight sm:text-5xl'>A quick look at how it works.</h2>
            <p className='mt-5 text-lg leading-8 text-muted-foreground'>
              See how Ledger turns everyday spending into clear, reviewable entries.
            </p>
          </div>
          <div className='mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border bg-background shadow-xl'>
            <video
              className='aspect-video w-full'
              autoPlay
              loop
              muted
              playsInline
              preload='auto'
              aria-label='Ledger product demonstration'
            >
              <source src='/videos/ledger-demo.mp4' type='video/mp4' />
              Your browser does not support the video element.
            </video>
          </div>
        </div>
      </section>

      <section className='border-t bg-primary text-primary-foreground'>
        <div className='mx-auto flex max-w-6xl flex-col gap-8 px-4 py-20 sm:px-8 md:flex-row md:items-center md:justify-between'>
          <div>
            <h2 className='text-3xl font-semibold tracking-tight'>Start with a better view.</h2>
            <p className='mt-3 max-w-lg text-primary-foreground/75'>Set up your own private Ledger with the documentation.</p>
          </div>
          <Button asChild variant='secondary' size='lg'><Link href='/docs'>Read the documentation <ArrowRight /></Link></Button>
        </div>
      </section>
    </main>
  )
}

export function DocsPage() {
  return (
    <main className='min-h-svh bg-muted/20'>
      <PublicHeader />
      <div className='mx-auto max-w-4xl px-4 py-10 sm:px-8 lg:py-16'>
        <article className='min-w-0'>
          <header className='mb-12 max-w-3xl'>
            <p className='mb-4 text-sm font-medium text-primary'>Documentation</p>
            <h1 className='text-4xl font-semibold tracking-tight sm:text-6xl'>Your Ledger, your way.</h1>
            <p className='mt-5 text-lg leading-8 text-muted-foreground'>Set up a private expense dashboard connected to your own Notion workspace and hosted on infrastructure you control.</p>
            <div className='mt-8 flex flex-wrap gap-3'>
              <Button asChild size='lg'>
                <a href='https://github.com/vigneshvaranasi/ledger' target='_blank' rel='noreferrer'><GitFork /> Fork on GitHub <ExternalLink /></a>
              </Button>
            </div>
          </header>

          <div className='space-y-12'>
            <DocsStep id='docs-0' number='01' icon={<GitFork className='size-5' />} title='Fork the repository'>
              <p>Start by creating your own copy. Open the repository, select <strong>Fork</strong>, and choose your GitHub account. You will deploy and customize your fork, not the original project.</p>
              <a href='https://github.com/vigneshvaranasi/ledger' target='_blank' rel='noreferrer' className='mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline'>Open the Ledger repository <ExternalLink className='size-3.5' /></a>
            </DocsStep>

            <DocsStep id='docs-1' number='02' icon={<Database className='size-5' />} title='Duplicate the Notion template'>
              <p>Open the ready-made Ledger database template, select <strong>Duplicate</strong>, and choose your own Notion workspace.</p>
              <a href='https://varanasivignesh.notion.site/ledger-template?v=0b27c8b2882e821cbb1688eee801f1b2&source=copy_link' target='_blank' rel='noreferrer' className='mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline'>Duplicate the Ledger Notion template <ExternalLink className='size-3.5' /></a>
            </DocsStep>

            <DocsStep id='docs-2' number='03' icon={<ShieldCheck className='size-5' />} title='Create a Notion integration'>
              <p>Open Notion&apos;s integrations page and create a new internal integration in the same workspace where you duplicated the database.</p>
              <a href='https://www.notion.so/my-integrations' target='_blank' rel='noreferrer' className='mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline'>Create a Notion integration <ExternalLink className='size-3.5' /></a>
            </DocsStep>

            <DocsStep id='docs-3' number='04' icon={<Database className='size-5' />} title='Connect the integration to your database'>
              <p>Open your duplicated database. Select the <strong>•••</strong> menu in the top-right corner, choose <strong>Connections</strong>, and select the integration you created.</p>
              <figure className='mt-4 overflow-hidden rounded-xl border bg-card'>
                <Image
                  src='/docs/notion-database-connection.png'
                  alt='Notion database menu showing Connections and the Ledger integration'
                  width={768}
                  height={768}
                  className='h-auto w-full'
                />
                <figcaption className='border-t px-4 py-3 text-xs text-muted-foreground'>In the database menu, open Connections and select your Ledger integration.</figcaption>
              </figure>
            </DocsStep>

            <DocsStep id='docs-4' number='05' icon={<Check className='size-5' />} title='Copy your Notion connection details'>
              <p>Copy the integration token from Notion and the ID of your duplicated database. You will add both values to <code className='rounded bg-muted px-1.5 py-0.5 text-sm'>.env.local</code> in the next step.</p>
            </DocsStep>

            <DocsStep id='docs-5' number='06' icon={<Terminal className='size-5' />} title='Install and configure'>
              <p>Clone your fork locally, install dependencies, and create your environment file.</p>
              <CodeBlock>{`git clone https://github.com/<your-username>/ledger.git
cd ledger
pnpm install
cp .env.example .env.local`}</CodeBlock>
              <p className='mt-6'>Add your own values to <code className='rounded bg-muted px-1.5 py-0.5 text-sm'>.env.local</code>:</p>
              <CodeBlock>{`NOTION_TOKEN=...
NOTION_DB_ID=...
SITE_PASSWORD=choose-a-strong-password
AUTH_SECRET=generate-a-long-random-value
LOG_TOKEN=generate-a-long-random-value
IS_DEMO=false
IS_AI_ENABLED=true
OPENAI_API_KEY=your-openai-api-key
AI_MODEL=gpt-4.1-mini`}</CodeBlock>
            </DocsStep>

            <DocsStep id='docs-6' number='07' icon={<Terminal className='size-5' />} title='Run it locally'>
              <p>Start the development server and open the local address in your browser.</p>
              <CodeBlock>{`pnpm dev
# Open http://localhost:3000`}</CodeBlock>
            </DocsStep>

            <DocsStep id='docs-7' number='08' icon={<Cloud className='size-5' />} title='Deploy your Ledger'>
              <p>Deploy the fork to the hosting platform of your choice. Add the same environment variables in its project settings, then build and start the application using the commands supported by that platform.</p>
              <div className='mt-5 rounded-xl border border-primary/20 bg-primary/5 p-5 text-sm leading-6'>
                <strong>Before going live:</strong> keep <code className='rounded bg-background px-1.5 py-0.5'>IS_DEMO=false</code>, use a strong <code className='rounded bg-background px-1.5 py-0.5'>SITE_PASSWORD</code>, and set <code className='rounded bg-background px-1.5 py-0.5'>IS_AI_ENABLED=true</code> only when your OpenAI key is configured.
              </div>
            </DocsStep>
          </div>
        </article>
      </div>
    </main>
  )
}

function DocsStep({ id, number, icon, title, children }: { id: string; number: string; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section id={id} className='scroll-mt-8'>
      <div className='flex gap-4'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-full border bg-card text-primary shadow-sm'>{icon}</div>
        <div className='min-w-0 flex-1'>
          <p className='text-xs font-semibold tracking-wider text-primary'>{number}</p>
          <h2 className='mt-2 text-2xl font-semibold tracking-tight'>{title}</h2>
          <div className='mt-4 space-y-4 leading-7 text-muted-foreground'>{children}</div>
        </div>
      </div>
    </section>
  )
}

function CodeBlock({ children }: { children: string }) {
  return <pre className='mt-5 overflow-x-auto rounded-xl border bg-slate-950 p-5 text-sm leading-6 text-slate-100 shadow-sm'><code>{children}</code></pre>
}
