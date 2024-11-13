import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingButton() {
    return (
        <Button
            disabled
            variant="default"
            size="lg"
            style={{ backgroundColor: '#1A0726', color: 'white', padding: '1.5rem 2rem', fontSize: '1.125rem', fontWeight: '400' }}>
            <Loader2 className="animate-spin " />
            Please wait
        </Button>
    );
}
