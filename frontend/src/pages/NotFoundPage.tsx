import { Link } from "react-router-dom"

const NotFoundPage = () => {
    return (
        <div className="flex flex-col gap-3 justify-center items-center m-4">
            <p className="text-4xl">404 Error</p>
            <Link className="text-4xl border-1 p-5 rounded-2xl font-semibold" to="/">Page Not Found</Link>
        </div>
    )
}

export default NotFoundPage