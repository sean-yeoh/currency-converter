import { setAndroidNavigationBar } from '~/lib/android-navigation-bar'
import { MoonStar } from '~/lib/icons/MoonStar'
import { Sun } from '~/lib/icons/Sun'
import { useColorScheme } from '~/lib/useColorScheme'
import { Button } from './ui/button'

export function ThemeToggle() {
  const { isDarkColorScheme, setColorScheme } = useColorScheme()

  function toggleColorScheme() {
    const newTheme = isDarkColorScheme ? 'light' : 'dark'

    setColorScheme(newTheme)
    setAndroidNavigationBar(newTheme)
  }

  return (
    <Button
      className="z-1"
      onPressIn={toggleColorScheme}
      variant="ghost"
      size="icon"
    >
      {isDarkColorScheme ? (
        <MoonStar className="text-foreground" size={23} strokeWidth={1.25} />
      ) : (
        <Sun className="text-foreground" size={24} strokeWidth={1.25} />
      )}
    </Button>
  )
}
