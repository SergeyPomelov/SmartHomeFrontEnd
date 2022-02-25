import {Device} from 'src/app/api.types'
import {LIGHT_BULB_ICON} from 'src/app/components/blocks/block.constants'

export function getIconClass(device: Device | undefined, iconName: string): string {
  if (device?.Name === 'Current Weather Hours' || device?.Name === 'Forecast') {
    return getForecastIcon(device.Data)
  }

  const on = device?.Status === 'On' || device?.SwitchType === 'Contact' && device?.Status === 'Open'
  const light = (device?.Type === 'Light/Switch' || device?.Type === 'Color Switch')
    && device.SubType !== 'Selector Switch'

  let addon = !on && light ? ' icon-off' : ''
  if (iconName === LIGHT_BULB_ICON) {
    addon += on ? ' fas' : ' far'
    return 'fa-' + iconName + addon
  }
  return 'fa fa-' + iconName + addon
}

function getForecastIcon(data: string): string {
  const lowerCaseData = data.toLocaleLowerCase('en-us')
  if (lowerCaseData.includes('rain') || lowerCaseData.includes('drizzle')) {
    return 'fa fa-cloud-rain'
  }
  if (lowerCaseData.includes('shower') || lowerCaseData.includes('thunder')) {
    return 'fa fa-cloud-showers-heavy'
  }
  if (lowerCaseData.includes('snow')) {
    return 'fa fa-snowflake'
  }
  if (lowerCaseData.includes('fog') || lowerCaseData.includes('smog')
    || lowerCaseData.includes('mist') || lowerCaseData.includes('smoke')) {
    return 'fa fa-smog'
  }
  if (lowerCaseData.includes('cloud') || lowerCaseData.includes('overcast')) {
    return 'fa fa-cloud'
  }
  if (lowerCaseData.includes('sun') || lowerCaseData.includes('clear')) {
    return 'fas fa-sun'
  }
  return 'fas fa-cloud-sun'
}
