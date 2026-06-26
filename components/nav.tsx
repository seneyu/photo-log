import { signOut } from "@/lib/actions/auth";

export default function Nav() {
  return (
    <nav>
      <form action={signOut} className="basis-2/3">
        <button type="submit">Sign out</button>
      </form>
    </nav>
  );
}
