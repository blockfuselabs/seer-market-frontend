import { WalletBalance } from "@/components/wallet/wallet-balance"
import { TransferForm } from "@/components/wallet/transfer-form"
import { TransactionHistory } from "@/components/wallet/transaction-history"
import Header from "@/components/layout/header"
// import { Header } from "@/components/layout/header" // Assuming Header is in this path

export default function WalletPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
            {/* Ambient Background */}
            <div className="pointer-events-none absolute top-[-20%] left-[-10%] h-[1000px] w-[1000px] rounded-full bg-violet-600/10 dark:bg-violet-600/10 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-[-20%] right-[-10%] h-[800px] w-[800px] rounded-full bg-fuchsia-600/10 dark:bg-fuchsia-600/10 blur-[120px]" />

            <Header />
            <div className="container max-w-5xl mx-auto py-12 px-4 relative z-10">
                <div className="grid gap-8 md:grid-cols-12 items-start">
                    <div className="md:col-span-7">
                        <WalletBalance />
                    </div>

                    <div className="md:col-span-5">
                        <TransferForm />
                    </div>

                    <div className="md:col-span-7">
                        <TransactionHistory />
                    </div>
                </div>
            </div>
        </div>
    )
}
