import React from "react";

function ErrorPage({error}){

    return(
        <div>
            <p className="text-bold text-green-900">{error.message}</p>
        </div>
    )

}

export default ErrorPage