import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native';
const minecraftItems = require('minecraft-items');
import React, { useState } from 'react';
import * as SecureStore from "expo-secure-store"
import { getuuid } from "./Utils/ApiUtils"
import * as FileSystem from "expo-file-system"

export default class App extends React.Component {

  state = {
    isLoading: true,
    data: ""
  }
  getData = async () => {
    try {
      let uuid = await SecureStore.getItemAsync('uuid')
      if (!uuid) { this.setState({ isLoading: false, data: null }); return; }
      let data = await fetch(`https://api.slothpixel.me/api/skyblock/profile/${uuid}`)
        .then((response) => response.json())
      this.setState({ data: data.members[uuid], isLoading: false })
    } catch (e) {
      console.log(e)

    }
  }
  componentDidMount() {
    this.getData()
  }






  renderItem = ({ item }) => {
    try {
      if (item) {

        const minecraftItem = minecraftItems.get(item.item_id);
        let imageSource = { uri: `data:image/png;base64,${minecraftItem.icon}` }
        let renderSkull = false
        if (minecraftItem.type == 397) {
          let localFile = `${FileSystem.documentDirectory}${item.attributes.id}.png`
          getFile(item.attributes)
          imageSource = { uri: localFile }
          renderSkull = true
        }
        return (
          <TouchableOpacity style={styles.itemContainer} onPress={() => this.renderLore(item)}>
            <View style={{ marginTop: -15, marginLeft: -15 }}>
              {renderSkull ? (
                <View style={{ overflow: "hidden", position: "absolute", width: 35, height: 35 }}>
                  <Image
                    source={imageSource}
                    style={{ width: 256, height: 256, position: "relative", left: -31, top: -31 }}
                    blurRadius={0}

                  />
                </View>
              ) : (
                <View>
                  <Image
                    source={imageSource}
                    style={{ width: 33, height: 33, position: "absolute" }}
                  />
                </View>
              )}
              <Text style={{
                position: 'absolute',
                left: 0,
                top: -5,
                color: "black",
                fontSize: 13
              }}>{item.count}</Text>
            </View>
          </TouchableOpacity>
        );
      } else {
        return (
          <View style={styles.itemContainer}>

          </View>
        )
      }
    } catch (e) {
      console.log(e)
    }
  }
  removeColorCodes = (string) => {
    if (string) {
      let colorless = string.replace(/§[0-9a-fk-or]/gi, "");
      return colorless
    } else {
      return ""
    }
  }
  renderLore = (item) => {
    try {
      let lore = this.removeColorCodes(item.name) + "\n\n"
      for (let lores of item.lore) {
        lore += this.removeColorCodes(lores + "\n")
      }
      alert(lore)
    } catch (e) {

    }
  }
  render() {

    if (this.state.isLoading) {
      return (
        <View style={{ flex: 1, paddingTop: 40 }}>
          <Text style={{ textAlign: "center", color: "#bcc3cf" }}>
            Loading...
          </Text>
          <ActivityIndicator />
        </View>
      );
    }
    const { data } = this.state;
    return (
      <View style={{ flex: 1, flexWrap: 'wrap', marginTop: 30, alignItems: "center" }}>
        <TextInput
          style={{ position: 'absolute', left: 0 }}
          placeholder='Username'
          onSubmitEditing={(event) => {
            getuuid(event.nativeEvent.text);
            this.getData();
            this.render()
          }}
        />
        {data && (
          <ScrollView style={{ marginTop: 20, flexDirection: "column", left: 0 }}>
            <Text>inventory</Text>
            <View style={{ flexDirection: "row" }}>
              <FlatList
                numColumns={9}
                data={data.inventory}
                renderItem={this.renderItem}
                scrollEnabled={false}
              />
            </View>
            <Text>Ender Chest</Text>
            <View style={{ flexDirection: "row" }}>
              <FlatList
                numColumns={9}
                data={data.ender_chest}
                renderItem={this.renderItem}
                scrollEnabled={false}
              />
            </View>
            <View style={{ flexDirection: "row" }}>
              <FlatList
                data={data.backpack}
                renderItem={({ item }) => {
                  return (
                    <View>
                      <FlatList
                        numColumns={9}
                        data={item}
                        renderItem={this.renderItem}
                        scrollEnabled={false}
                      />
                    </View>
                  )
                }}
                scrollEnabled={false}
                ItemSeparatorComponent={() => {
                  return (
                    <View style={{ marginTop: 15 }}>
                      <Text>Backpack</Text>
                    </View>
                  )
                }}
              />
            </View>
          </ScrollView>
        )}

      </View>
    );
  }
}

function convertMinecraftColoredText(text) {
  const colorCodeRegex = /§([0-9a-fklmnor])/gi;
  const colors = {
    '0': 'black',
    '1': 'dark_blue',
    '2': 'dark_green',
    '3': 'dark_aqua',
    '4': 'dark_red',
    '5': 'dark_purple',
    '6': 'gold',
    '7': 'gray',
    '8': 'dark_gray',
    '9': 'blue',
    'a': 'green',
    'b': 'aqua',
    'c': 'red',
    'd': 'light_purple',
    'e': 'yellow',
    'f': 'white',
  };
  const styles = {
    'k': 'obfuscated',
    'l': 'bold',
    'm': 'strikethrough',
    'n': 'underline',
    'o': 'italic',
    'r': 'reset',
  };

  let result = [];
  let currentText = '';
  let currentColor = null;
  let currentStyles = [];

  function pushText() {
    if (currentText) {
      result.push({
        text: currentText,
        color: currentColor,
        styles: [...currentStyles],
      });
      currentText = '';
    }
  }

  text.replace(colorCodeRegex, (match, code) => {
    if (code === 'r') {
      pushText();
      currentColor = null;
      currentStyles = [];
    } else {
      pushText();
      if (code in colors) {
        currentColor = colors[code];
      } else if (code in styles) {
        const style = styles[code];
        if (!currentStyles.includes(style)) {
          currentStyles.push(style);
        }
      }
    }
  });

  pushText();

  return result;
}

async function getFile(item) {
  let localFile = `${FileSystem.documentDirectory}${item.id}.png`
  try {
    await FileSystem.readAsStringAsync(localFile)
  } catch (e) {
    let url = `http://textures.minecraft.net/texture/${item.texture}`
    await FileSystem.downloadAsync(url, localFile)
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContainer: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'gray',
    padding: 18,
    height: 20,
    margin: 1,
  },
});
/*
<Text>Backpacks</Text>

            <View style={{ flexDirection: "row" }}>
              <FlatList
                data={data.backpack}
                renderItem={(item) => {
                  return (
                    <View>
                      <FlatList
                        numColumns={9}
                        data={item}
                        renderItem={this.renderItem}
                        scrollEnabled={false}
                      />
                    </View>
                  )

                }}
                scrollEnabled={false}
              />
            </View>
            <Text>Ender Chest</Text>
            <View style={{ flexDirection: "row" }}>
              <FlatList
                numColumns={9}
                data={data.ender_chest}
                renderItem={this.renderItem}
                scrollEnabled={false}
              />
            </View>
            */