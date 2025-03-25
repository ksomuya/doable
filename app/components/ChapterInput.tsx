import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { PlusCircle, Check, X } from "lucide-react-native";

interface ChapterInputProps {
  onSave?: (chapters: string[]) => void;
  initialChapters?: string[];
}

const ChapterInput = ({
  onSave = () => {},
  initialChapters = [],
}: ChapterInputProps) => {
  const [chapters, setChapters] = useState<string[]>(initialChapters);
  const [newChapter, setNewChapter] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Update chapters when initialChapters prop changes
  useEffect(() => {
    setChapters(initialChapters);
  }, [initialChapters]);

  const addChapter = () => {
    if (newChapter.trim() !== "" && !chapters.includes(newChapter.trim())) {
      const updatedChapters = [...chapters, newChapter.trim()];
      setChapters(updatedChapters);
      setNewChapter("");
      onSave(updatedChapters);
    }
  };

  const removeChapter = (index: number) => {
    const updatedChapters = chapters.filter((_, i) => i !== index);
    setChapters(updatedChapters);
    onSave(updatedChapters);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View className="bg-white p-4 rounded-xl shadow-md w-full">
      <TouchableOpacity
        onPress={toggleExpand}
        className="flex-row justify-between items-center mb-2"
      >
        <Text className="text-lg font-semibold text-gray-800">
          Chapters Studied Today
        </Text>
        <PlusCircle size={24} color="#4F46E5" />
      </TouchableOpacity>

      {isExpanded ? (
        <View className="mt-2">
          <View className="flex-row items-center mb-4">
            <TextInput
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 mr-2"
              placeholder="Enter chapter name"
              value={newChapter}
              onChangeText={setNewChapter}
            />
            <TouchableOpacity
              onPress={addChapter}
              className="bg-indigo-600 p-2 rounded-lg"
            >
              <Check size={20} color="white" />
            </TouchableOpacity>
          </View>

          {chapters.length > 0 ? (
            <ScrollView
              className="max-h-32"
              showsVerticalScrollIndicator={true}
            >
              {chapters.map((chapter, index) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center bg-gray-100 rounded-lg p-3 mb-2"
                >
                  <Text className="flex-1 text-gray-700">{chapter}</Text>
                  <TouchableOpacity onPress={() => removeChapter(index)}>
                    <X size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View className="py-4 items-center">
              <Text className="text-gray-500 italic">
                No chapters added yet
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={toggleExpand}
            className="mt-3 bg-gray-200 py-2 rounded-lg items-center"
          >
            <Text className="text-gray-700">Done</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="py-2">
          {chapters.length > 0 ? (
            <Text className="text-gray-600">
              {chapters.length} chapter{chapters.length !== 1 ? "s" : ""} added
            </Text>
          ) : (
            <Text className="text-gray-500 italic">
              Add chapters you've studied today to improve recommendations
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default ChapterInput;
