import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { useSimulation } from "@/context/simulation-context";
import { History, ListRestart } from "lucide-react";

type SessionHistoryProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function SessionHistory({ open, onOpenChange }: SessionHistoryProps) {
    const { history, loadFromHistory, clearHistory } = useSimulation();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <History className="h-6 w-6" />
                        Session History
                    </SheetTitle>
                    <SheetDescription>
                        Review and reload past simulation scenarios.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-3 h-[calc(100%-150px)] overflow-y-auto">
                    {history.length === 0 ? (
                        <div className="text-center text-muted-foreground pt-16">
                            <p>No history yet.</p>
                            <p className="text-sm">Run a full scenario to save it here.</p>
                        </div>
                    ) : (
                        history.map((session, index) => (
                            <div key={session.id} className="p-3 border rounded-lg flex justify-between items-center gap-2">
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{session.name}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(session.timestamp).toLocaleString()}</p>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => {
                                    loadFromHistory(session.id);
                                    onOpenChange(false);
                                }}>
                                    Load
                                </Button>
                            </div>
                        ))
                    )}
                </div>
                <SheetFooter>
                    <div className="w-full flex justify-between">
                         <Button variant="destructive" onClick={clearHistory} disabled={history.length === 0}>
                            <ListRestart className="mr-2 h-4 w-4"/>
                            Clear History
                        </Button>
                        <SheetClose asChild>
                            <Button variant="outline">Close</Button>
                        </SheetClose>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
