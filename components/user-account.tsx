import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getSessionIdentity } from "@/lib/identity";
import { cn } from "@/lib/utils";

export async function UserAccount() {
  const t = await getTranslations("Header");
  const identity = await getSessionIdentity();

  if (identity === null) {
    return (
      <Link
        href="/login"
        data-user-state="signed-out"
        className={cn(
          buttonVariants({ variant: "default", size: "lg" }),
          "h-10 px-3",
        )}
      >
        {t("signIn")}
      </Link>
    );
  }

  return (
    <p
      data-user-state="signed-in"
      className="max-w-40 truncate rounded-lg border border-white/70 bg-white/70 px-3 py-2 text-sm font-medium sm:max-w-56"
      title={identity || t("account")}
    >
      <span className="sr-only">{t("account")}: </span>
      {identity || t("account")}
    </p>
  );
}
