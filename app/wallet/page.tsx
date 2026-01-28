import { WalletBalance } from "@/components/wallet/wallet-balance"
import { TransferForm } from "@/components/wallet/transfer-form"

export default function WalletPage() {
    return (
        <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
                <p className="text-muted-foreground">
                    Manage your assets and send funds securely.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                    <WalletBalance />
                </div>
                <div className="md:col-span-2 lg:col-span-1 lg:col-start-1">
                    <TransferForm />
                </div>
            </div>
        </div>
    )
}
