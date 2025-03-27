import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Plus,
  MessageSquare,
  Send,
} from "lucide-react-native";

// Mock data for feature requests
const initialFeatureRequests = [
  {
    id: "1",
    title: "Dark Mode Support",
    description: "Add dark mode to reduce eye strain at night",
    upvotes: 24,
    downvotes: 3,
    status: "Under Review",
    comments: [
      { id: "c1", user: "Sarah", text: "This would be amazing!" },
      { id: "c2", user: "Mike", text: "Please prioritize this feature" },
    ],
  },
  {
    id: "2",
    title: "Offline Mode",
    description: "Allow users to access content without internet connection",
    upvotes: 18,
    downvotes: 2,
    status: "Planned",
    comments: [{ id: "c3", user: "Alex", text: "Essential for travel!" }],
  },
  {
    id: "3",
    title: "Calendar Integration",
    description: "Sync tasks with phone calendar",
    upvotes: 12,
    downvotes: 5,
    status: "Considering",
    comments: [],
  },
];

export default function FeatureRequestsScreen() {
  const router = useRouter();
  const [featureRequests, setFeatureRequests] = useState(
    initialFeatureRequests,
  );
  const [newRequestTitle, setNewRequestTitle] = useState("");
  const [newRequestDescription, setNewRequestDescription] = useState("");
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [newComment, setNewComment] = useState("");

  const handleBackPress = () => {
    router.back();
  };

  const handleVote = (id, voteType) => {
    setFeatureRequests(
      featureRequests.map((request) => {
        if (request.id === id) {
          if (voteType === "up") {
            return { ...request, upvotes: request.upvotes + 1 };
          } else {
            return { ...request, downvotes: request.downvotes + 1 };
          }
        }
        return request;
      }),
    );
  };

  const handleAddRequest = () => {
    if (!newRequestTitle.trim() || !newRequestDescription.trim()) {
      Alert.alert("Error", "Please fill in both title and description");
      return;
    }

    const newRequest = {
      id: Date.now().toString(),
      title: newRequestTitle,
      description: newRequestDescription,
      upvotes: 0,
      downvotes: 0,
      status: "New",
      comments: [],
    };

    setFeatureRequests([newRequest, ...featureRequests]);
    setNewRequestTitle("");
    setNewRequestDescription("");
    setShowNewRequestForm(false);
    Alert.alert("Success", "Your feature request has been submitted!");
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !activeRequest) return;

    const updatedRequests = featureRequests.map((request) => {
      if (request.id === activeRequest.id) {
        const newCommentObj = {
          id: `c${Date.now()}`,
          user: "You", // In a real app, this would be the current user's name
          text: newComment,
        };
        return {
          ...request,
          comments: [...request.comments, newCommentObj],
        };
      }
      return request;
    });

    setFeatureRequests(updatedRequests);
    setNewComment("");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "New":
        return "#6366F1"; // Indigo
      case "Under Review":
        return "#F59E0B"; // Amber
      case "Planned":
        return "#10B981"; // Emerald
      case "Considering":
        return "#8B5CF6"; // Violet
      default:
        return "#6B7280"; // Gray
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feature Requests</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowNewRequestForm(!showNewRequestForm)}
        >
          <Plus size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {showNewRequestForm ? (
          <View style={styles.newRequestForm}>
            <Text style={styles.formTitle}>Submit New Feature Request</Text>
            <TextInput
              style={styles.input}
              placeholder="Feature title"
              value={newRequestTitle}
              onChangeText={setNewRequestTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the feature you'd like to see"
              value={newRequestDescription}
              onChangeText={setNewRequestDescription}
              multiline
              numberOfLines={4}
            />
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.formButton, styles.cancelButton]}
                onPress={() => {
                  setShowNewRequestForm(false);
                  setNewRequestTitle("");
                  setNewRequestDescription("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formButton, styles.submitButton]}
                onPress={handleAddRequest}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : activeRequest ? (
          <View style={styles.requestDetail}>
            <TouchableOpacity
              style={styles.backToList}
              onPress={() => setActiveRequest(null)}
            >
              <ArrowLeft size={16} color="#4F46E5" />
              <Text style={styles.backToListText}>Back to list</Text>
            </TouchableOpacity>

            <View style={styles.requestHeader}>
              <Text style={styles.detailTitle}>{activeRequest.title}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(activeRequest.status) },
                ]}
              >
                <Text style={styles.statusText}>{activeRequest.status}</Text>
              </View>
            </View>

            <Text style={styles.detailDescription}>
              {activeRequest.description}
            </Text>

            <View style={styles.voteContainer}>
              <TouchableOpacity
                style={styles.voteButton}
                onPress={() => handleVote(activeRequest.id, "up")}
              >
                <ThumbsUp size={16} color="#10B981" />
                <Text style={styles.voteCount}>{activeRequest.upvotes}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.voteButton}
                onPress={() => handleVote(activeRequest.id, "down")}
              >
                <ThumbsDown size={16} color="#EF4444" />
                <Text style={styles.voteCount}>{activeRequest.downvotes}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.commentsSection}>
              <Text style={styles.commentsTitle}>
                Comments ({activeRequest.comments.length})
              </Text>

              {activeRequest.comments.length > 0 ? (
                activeRequest.comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <Text style={styles.commentUser}>{comment.user}</Text>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noComments}>
                  No comments yet. Be the first to comment!
                </Text>
              )}

              <View style={styles.addCommentContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChangeText={setNewComment}
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleAddComment}
                >
                  <Send size={20} color="#4F46E5" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>All Feature Requests</Text>
            {featureRequests.map((request) => (
              <TouchableOpacity
                key={request.id}
                style={styles.requestCard}
                onPress={() => setActiveRequest(request)}
              >
                <View style={styles.requestCardHeader}>
                  <Text style={styles.requestTitle}>{request.title}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(request.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{request.status}</Text>
                  </View>
                </View>

                <Text style={styles.requestDescription} numberOfLines={2}>
                  {request.description}
                </Text>

                <View style={styles.requestCardFooter}>
                  <View style={styles.voteInfo}>
                    <View style={styles.voteItem}>
                      <ThumbsUp size={14} color="#10B981" />
                      <Text style={styles.voteText}>{request.upvotes}</Text>
                    </View>
                    <View style={styles.voteItem}>
                      <ThumbsDown size={14} color="#EF4444" />
                      <Text style={styles.voteText}>{request.downvotes}</Text>
                    </View>
                  </View>

                  <View style={styles.commentCount}>
                    <MessageSquare size={14} color="#6B7280" />
                    <Text style={styles.commentCountText}>
                      {request.comments.length}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  requestCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "white",
  },
  requestDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  requestCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  voteInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  voteItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  voteText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  commentCount: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentCountText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  newRequestForm: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  formButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  submitButton: {
    backgroundColor: "#4F46E5",
  },
  cancelButtonText: {
    color: "#4B5563",
    fontWeight: "500",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "500",
  },
  requestDetail: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  backToList: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backToListText: {
    color: "#4F46E5",
    marginLeft: 4,
    fontWeight: "500",
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },
  detailDescription: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 16,
    lineHeight: 24,
  },
  voteContainer: {
    flexDirection: "row",
    marginBottom: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
    paddingVertical: 12,
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
    padding: 8,
  },
  voteCount: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#4B5563",
  },
  commentsSection: {
    marginTop: 8,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  commentItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  commentUser: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  noComments: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginBottom: 16,
  },
  addCommentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 20,
    padding: 12,
    fontSize: 14,
    marginRight: 8,
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
});
