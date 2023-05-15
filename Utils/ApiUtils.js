import { Warn } from './Toast';
import { SaveData } from './SecureStore';
async function getapikey(apikey) {
  try {
    const apikey1 = await fetch(`https://api.hypixel.net/key?key=${apikey}`).then((response) => response.json());
    if (apikey1.success == true) {
      SaveData('apikey', apikey);
      Warn(`api key saved: ${apikey}`);
    } else {
      Warn('Invalid api key');
      if (apikey == '') {
        SaveData('apikey', '');
      }
    }
  } catch (e) {
    Warn('Error, failed to check api key validity.');
  }
}

async function getuuid(username) {
  try {
    const uuid1 = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`).then((response) => response.json());
    if (uuid1 != '') {
      SaveData('uuid', uuid1.id);
      Warn(`uuid saved: ${uuid1.id}`);
    }
  } catch (e) {
    Warn('Invalid username');
  }
}

async function GetProfile(uuid, apikey) {
  try {
    if (uuid && apikey) {
      try {
        const profiledata = await fetch(`https://api.hypixel.net/skyblock/profiles?uuid=${uuid}&key=${apikey}`)
          .then((response) => response.json());
        if (profiledata.success == true) // is something invalid?
        {
          for (let i = 0; i < 69; i++) // get selected profile
          {
            if (profiledata.profiles[i].selected == true) {
              return profiledata.profiles[i]; //success
            }
          }
        } else if (profiledata.cause == 'Malformed UUID') {
          alert('Invalid UUID');
          return null;
        } else if (profiledata.cause == 'Invalid API key') {
          alert('Invalid api key');
          return null;
        }
      } catch (a) {
        if (a == 'TypeError: Network request failed') {
          Warn('No internet connection');
          return null;
        } else {
          alert(`Api request failed\nError: ${a}`);
          return null;
        }
      }
    } else {
      return null;
    }

  } catch (e) {

  }
}

export { getapikey, getuuid, GetProfile };
