import { Building2Icon, FactoryIcon, IdCardIcon, UsersIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <Card className="rounded-md border bg-card p-0 shadow-none">
        <CardContent className="p-6">
          <div className="mx-auto flex min-h-40 max-w-4xl flex-col items-center justify-center rounded-lg border bg-muted/20 text-center">
            <h2 className="text-5xl font-semibold tracking-tight">Infoly</h2>
            <p className="mt-2 text-muted-foreground">Chowa, Panchdona</p>
            <p className="text-muted-foreground">01914702000</p>
            <p className="text-muted-foreground">admin@infoly.com</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-0 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md">
          <CardContent className="flex items-end justify-between p-6">
            <div>
              <p className="font-medium text-white/90">Total Unit</p>
              <FactoryIcon className="mt-6 size-6" />
            </div>
            <p className="text-5xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md">
          <CardContent className="flex items-end justify-between p-6">
            <div>
              <p className="font-medium text-white/90">Total Buyer</p>
              <UsersIcon className="mt-6 size-6" />
            </div>
            <p className="text-5xl font-bold">11</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md">
          <CardContent className="flex items-end justify-between p-6">
            <div>
              <p className="font-medium text-white/90">Total Staff</p>
              <IdCardIcon className="mt-6 size-6" />
            </div>
            <p className="text-5xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md">
          <CardContent className="flex items-end justify-between p-6">
            <div>
              <p className="font-medium text-white/90">Total Worker</p>
              <Building2Icon className="mt-6 size-6" />
            </div>
            <p className="text-5xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>BIM Stocks Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-lg">
            <p>Today In: <span className="font-semibold">0.00</span></p>
            <p>Today Out: <span className="font-semibold">0.00</span></p>
            <p>Today Net: <span className="font-semibold">0.00</span></p>
            <div className="my-2 border-t" />
            <p>Total In: <span className="font-semibold">5,244.50</span></p>
            <p>Total Out: <span className="font-semibold">231.18</span></p>
            <p>Total Net: <span className="font-semibold">5,013.32</span></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Yarn Stocks Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-lg">
            <p>Today In: <span className="font-semibold">0.00</span></p>
            <p>Today Out: <span className="font-semibold">0.00</span></p>
            <p>Today Net: <span className="font-semibold">0.00</span></p>
            <div className="my-2 border-t" />
            <p>Total In: <span className="font-semibold">5,000.00</span></p>
            <p>Total Out: <span className="font-semibold">24,215,968.21</span></p>
            <p>Total Net: <span className="font-semibold">-24,210,968.21</span></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ledger Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-lg">
            <p>Today Debit: <span className="font-semibold">0.00</span></p>
            <p>Today Credit: <span className="font-semibold">0.00</span></p>
            <p>Today Balance: <span className="font-semibold">0.00</span></p>
            <div className="my-2 border-t" />
            <p>Total Debit: <span className="font-semibold">15,874,850.90</span></p>
            <p>Total Credit: <span className="font-semibold">14,018,854.07</span></p>
            <p>Total Balance: <span className="font-semibold">1,855,996.83</span></p>
            <p>Active Buyers: <span className="font-semibold">10</span></p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
