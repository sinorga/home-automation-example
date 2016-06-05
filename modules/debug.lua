function debug(cmd)
  if cmd == "clean" then
    for _, user in pairs(User.listUsers()) do
        User.deleteUser({id = user.id})
    end
    return User.listUsers()
  end
  if cmd == "activate" then
    for _, user in pairs(User.listUsers()) do
        if user.status == 0 then
          User.updateUser({id = user.id, status = 1})
        end
    end
    return User.listUsers()
  end

  local _, _, module, fun, args = string.find(cmd, "([%a]+) ([%a]+) (.*)")

  if module == nil then
    _, _, module, fun, args = string.find(cmd, "([%a]+) ([%a]+)")
  end

  if module ~= nil and fun ~= nil then
    if args == nil then
      args = {}
    else
      args = from_json(args)
    end

    return _G[module][fun](args)
  end
  return "Unknown command"
end
