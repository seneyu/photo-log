import { signOut } from "@/lib/actions/auth";

export default function MapPage() {
  return (
    <div>
      Welcome to Map!
      <form action={signOut}>
        <button type="submit">Sign out</button>
      </form>
    </div>
  );
}
