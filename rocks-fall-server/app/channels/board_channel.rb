class BoardChannel < ApplicationCable::Channel
  # identified_by :uuid

  def connect
    # self.uuid = SecureRandom.urlsafe_base64
    # self.uuid = 'BoardChannel'
  end
  
  def subscribed
    puts 'subbed'
    stream_from "players"
  end

  def receive(data)
    puts('--')
    puts data
    puts('--')
    ActionCable.server.broadcast("players", data)
  end
end