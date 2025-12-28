import { useAnimatedThemeToggle } from "@/context/theme.context";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const toggleTheme = useAnimatedThemeToggle();

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const coords = [e.clientX, e.clientY] as [number, number];
    toggleTheme(coords);
  }
  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className="w-full flex justify-start !py-[6px] !px-[8px]"
    >
      <svg
        className="size-4"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
        <path d="M12 3l0 18"></path>
        <path d="M12 9l4.65 -4.65"></path>
        <path d="M12 14.3l7.37 -7.37"></path>
        <path d="M12 19.6l8.85 -8.85"></path>
      </svg>
      Theme
    </Button>
  );
}
