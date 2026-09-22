import "./styles/LoginPage.css"

export function LoginPage() {
  return (
    <>
      <div className="flex flex-col justify-center items-center" style={{position: "absolute", top: "0", bottom: "0", left: "0", right: "0"}}>
        <div className="flex flex-col justify-center items-center text-center rounded-xl w-full max-w-100 bg-white pt-2.5 pb-2.5 pl-2 pr-2 gap-3">
          <h1 className="text-6xl sm:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-black via-black to-black/40 drop-shadow-[0_0_30px_rgba(255,255,255,0.25)]">
            42SH
          </h1>
          <div className="bg-(--bright-purple) w-30 h-1"></div>
            <a className="effect effect-1 w-full rounded bg-(--bright-purple) hover:bg-(--purple) btn-primary btn-md login-button pt-1.5 pb-1.5 pr-3 pl-3" href="http://localhost:8000/auth/login/">
              Login with 42
            </a>
        </div>
      </div>
    </>
  );
}
