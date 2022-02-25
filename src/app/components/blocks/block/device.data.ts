import {Device} from 'src/app/api.types'
import {SHOW_DATA_TYPES} from 'src/app/components/blocks/block.constants'

export function getData(device: Device | undefined, dataIsUpdateTime: boolean): string | undefined {

  if (!device) {
    return undefined
  }

  if (dataIsUpdateTime) {
    return device.LastUpdate
  }

  if (device.Type === 'Humidity') {
    return device.Data.replace('Humidity ', '')
  }

  if (device.SubType === 'kWh') {
    return device.Usage + ' ' + device.CounterToday + ' ' + device.Data
  }

  if (device.Type === 'Wind') {
    return device.Speed + '-' + device.Gust + 'm/s ' + device.DirectionStr
  }

  return SHOW_DATA_TYPES.includes(device.Type) ? device.Data : undefined
}
