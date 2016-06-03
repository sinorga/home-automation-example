response.message = Timeseries.write({
  query = datapoint.alias .. ",sn=" .. datapoint.device_sn .. " value=0.1"
})
