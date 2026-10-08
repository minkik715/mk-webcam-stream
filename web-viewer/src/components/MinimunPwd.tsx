import { useRef } from "react"

export const MinimumPwd = (
    { setAuth }: { setAuth: (auth: boolean) => void } ) => {
  const pwdRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    const password = pwdRef.current?.value ?? "";

    if (password === "123456") {
      setAuth(true);
      return;
    }

    pwdRef.current!.value = "";
    setAuth(false);
  };

  return (
    <div>
      <input
        ref={pwdRef}
        type="password"
        placeholder="Input your password"
      />

      <button type="button" onClick={handleClick}>
        확인
      </button>
    </div>
  );
};