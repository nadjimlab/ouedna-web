import { redirect } from "next/navigation";

/**
 * The public place directory lives at /explore. Keep /place as a friendly
 * entry point so shared links without an id never fall into the 404 page.
 */
export default function PlaceDirectoryRedirect() {
  redirect("/explore");
}
