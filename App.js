import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as MediaLibrary from "expo-media-library";
import { captureRef } from "react-native-view-shot";
import * as ImagePicker from "expo-image-picker";
import domtoimage from "dom-to-image";

import ImageViewer from "./components/ImageViewer";
import Button from "./components/Button";
import IconButton from "./components/IconButton";
import CircleButton from "./components/CircleButton";
import EmojiPicker from "./components/EmojiPicker";
import EmojiList from "./components/EmojiList";
import EmojiSticker from "./components/EmojiSticker";

const placeholderImage = require("./assets/images/background-image.png");

export default function App() {
  const imageRef = useRef(null);
  const [status, requestPremission] = MediaLibrary.usePermissions();
  if (status == null) {
    requestPremission();
  }
  const [selectedImage, setSelectedImage] = useState(undefined);
  const [showOptions, setShowOptions] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pickedEmoji, setPickedEmoji] = useState(undefined);

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    } else {
      alert("You did not select Image ");
    }
  };

  const onReset = () => {
    setPickedEmoji(undefined);
  };
  const onSave = async () => {
    if (Platform.OS != "web") {
      try {
        const localUri = await captureRef(imageRef, {
          height: 440,
          quality: 1,
        });
        await MediaLibrary.saveToLibraryAsync(localUri);
        if (localUri) {
          alert("saved");
        }
      } catch (e) {
        requestPremission();
      }
    } else {
      try {
        const dataUrl = await domtoimage.toJpeg(imageRef.current, {
          quality: 0.95,
          width: 320,
          height: 440,
        });

        let link = document.createElement("a");
        link.download = "sticker-smash.jpeg";
        link.href = dataUrl;
        link.click();
      } catch (e) {
        console.log(e);
      }
    }
  };

  const onImagePicker = () => {
    setModalVisible(true);
  };
  const onModalClose = () => {
    setModalVisible(false);
  };
  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.imageContainer}>
        <View ref={imageRef} collapsable={false}>
          <ImageViewer
            placeholder={placeholderImage}
            selctedImage={selectedImage}
          />
          {pickedEmoji && (
            <EmojiSticker imageSize={40} stickerSource={pickedEmoji} />
          )}
        </View>
      </View>
      {showOptions ? (
        <View style={styles.optionsContainer}>
          <View style={styles.optionsRow}>
            <IconButton name="refresh" label="reset" onPress={onReset} />
            <CircleButton onPress={onImagePicker} />
            <IconButton name="save-alt" label="save" onPress={onSave} />
          </View>
        </View>
      ) : (
        <View style={styles.footerContainer}>
          <Button
            theme="primary"
            label="choose a photo"
            onPress={pickImageAsync}
          />
          <Button label="use this photo" onPress={() => setShowOptions(true)} />
        </View>
      )}
      <EmojiPicker onClose={onModalClose} isVisable={modalVisible}>
        <EmojiList onSelect={setPickedEmoji} onClose={onModalClose} />
      </EmojiPicker>

      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  imageContainer: {
    flex: 1,
    paddingTop: 58,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: "center",
  },
  optionsContainer: {
    position: "absolute",
    bottom: 70,
  },
  optionsRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 20,
  },
});
