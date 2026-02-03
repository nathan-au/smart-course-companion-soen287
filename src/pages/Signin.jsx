function Signin() {
    return (
        <>
            <div className="min-h-screen flex flex-col justify-center items-center">
                <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                    <legend className="fieldset-legend">Sign In</legend>

                    <label className="label">Email</label>
                    <input type="email" className="input" placeholder="Email" />

                    <label className="label">Password</label>
                    <input type="password" className="input" placeholder="Password" />

                    <button className="btn btn-neutral mt-4">Sign In</button>
                </fieldset>
            </div>
        </>

    )
}

export default Signin