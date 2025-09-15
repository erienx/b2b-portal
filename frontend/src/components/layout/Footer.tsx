export default function Footer() {
    return (
        <footer className="bg-surface border-t border-surfaceLight py-4 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-grey text-sm">
                B2B Distributor Portal • {new Date().getFullYear()} • For technical support, contact your system administrator
            </div>
        </footer>
    );
}
